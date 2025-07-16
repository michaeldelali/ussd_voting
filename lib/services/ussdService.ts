import { prisma, type UssdSession } from '../database/models';
import { paymentService } from './paymentService';

interface UssdResponse {
  USERID: string | null;
  MSISDN: string;
  USERDATA: string | null;
  MSG: string;
  MSGTYPE: boolean;
}

interface TransactionData {
  flow?: string;
  candidate_id?: number;
  candidate_name?: string;
  candidate_code?: string;
  vote_count?: number;
  amount?: number;
  donation_amount?: number;
  network?: string;
}

export class UssdService {
  async processInput(
    sessionId: string,
    userId: string,
    msisdn: string,
    userData: string,
    msgType: boolean,
    network: string
  ): Promise<UssdResponse> {
    try {
      console.log('USSD Input:', { sessionId, userId, msisdn, userData, msgType, network });

      let session = await prisma.ussdSession.findUnique({
        where: { sessionId }
      });
      const input = userData;


      // Initialize new session
      if (!session) {
        // Convert msgType to boolean if it's a string
        const msgTypeBoolean = typeof msgType === 'string'
          ? msgType === 'true' || msgType === '1'
          : Boolean(msgType);

        session = await prisma.ussdSession.create({
          data: {
            sessionId: sessionId,
            msisdn: msisdn,
            menuState: 'MAIN_MENU',
            network: network || null,
            msgType: msgTypeBoolean,
            userId: userId || null,
            userData: userData || null,
            transactionData: {}
          }
        });
        return this.mainMenu(session);
      }

      // Handle back to main menu
      if (input === '0') {
        await prisma.ussdSession.update({
          where: { sessionId },
          data: { menuState: 'MAIN_MENU' }
        });
        return this.mainMenu(session);
      }

      // Handle back navigation
      if (input.toLowerCase() === 'b') {
        return this.handleBackNavigation(session);
      }

      // Handle menu states
      switch (session.menuState) {
        case 'MAIN_MENU':
          return this.handleMainMenu(input, session);
        case 'ENTER_GROUP_CODE':
          return this.handleEnterGroupCode(input, session);
        case 'ENTER_VOTE_COUNT':
          return this.handleEnterVoteCount(input, session);
        case 'CONFIRM_VOTE_PAYMENT':
          return this.handleConfirmVotePayment(input, session);
        case 'ENTER_MOMO_PIN':
          return this.handleEnterMomoPin(input, session);
        case 'DONATE_FLOW':
          return this.handleDonateFlow(input, session);
        case 'ENTER_DONATION_AMOUNT':
          return this.handleEnterDonationAmount(input, session);
        case 'CONFIRM_DONATION':
          return this.handleConfirmDonation(input, session);
        default:
          return this.endSession('Invalid selection', session);
      }
    } catch (error) {
      console.error('USSD Service Error:', error);
      return this.endSession('Service temporarily unavailable. Please try again later.');
    }
  }

  private mainMenu(session?: UssdSession): UssdResponse {
    if (session) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Welcome to Borbor Carnival 25\n\n1. Vote\n2. Donate",
        "MSGTYPE": true
      };
    }
    return {
      "USERID": "",
      "MSISDN": "",
      "USERDATA": "",
      "MSG": "Welcome to Borbor Carnival 25\n\n1. Vote\n2. Donate",
      "MSGTYPE": true
    };
  }

  private async handleMainMenu(input: string, session: UssdSession): Promise<UssdResponse> {
    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;

    switch (input) {
      case '1':
        await prisma.ussdSession.update({
          where: { sessionId: session.sessionId },
          data: {
            menuState: 'ENTER_GROUP_CODE',
            prevMenuState: 'MAIN_MENU',
            transactionData: { ...transactionData, flow: 'vote' }
          }
        });
        return {
          "USERID": session.userId,
          "MSISDN": session.msisdn,
          "USERDATA": session.userData,
          "MSG": "Enter group code number:",
          "MSGTYPE": true
        };

      case '2':
        await prisma.ussdSession.update({
          where: { sessionId: session.sessionId },
          data: {
            menuState: 'DONATE_FLOW',
            prevMenuState: 'MAIN_MENU',
            transactionData: { ...transactionData, flow: 'donate' }
          }
        });
        return this.handleDonateFlow('', session);

      default:
        return this.endSession('Invalid selection', session);
    }
  }

  private async handleEnterGroupCode(input: string, session: UssdSession): Promise<UssdResponse> {
    const groupCode = input.trim();

    if (!groupCode) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Invalid code. Please try again:",
        "MSGTYPE": true
      };
    }

    // Validate group code
    const candidate = await prisma.candidate.findFirst({
      where: {
        code: groupCode,
        isActive: true
      }
    });

    if (!candidate) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Invalid code. Please try again:",
        "MSGTYPE": true
      };
    }

    // Store candidate in session
    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;
    transactionData.candidate_id = candidate.id;
    transactionData.candidate_name = candidate.name;
    transactionData.candidate_code = candidate.code;

    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: {
        menuState: 'ENTER_VOTE_COUNT',
        prevMenuState: 'ENTER_GROUP_CODE',
        transactionData: JSON.parse(JSON.stringify(transactionData))
      }
    });

    return {
      "USERID": session.userId,
      "MSISDN": session.msisdn,
      "USERDATA": session.userData,
      "MSG": `You have selected: ${candidate.name}\nEnter number of votes (GHS1 per vote):`,
      "MSGTYPE": true
    };
  }

  private async handleEnterVoteCount(input: string, session: UssdSession): Promise<UssdResponse> {
    const trimmedInput = input.trim();

    const voteCount = Number(trimmedInput);
    
    if (
      !/^[1-9]\d*$/.test(trimmedInput) ||
      isNaN(voteCount) ||
      !Number.isInteger(voteCount) ||
      voteCount <= 0
    ) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Invalid number. Please enter a valid number of votes:",
        "MSGTYPE": true
      };
    }

    if (voteCount > 1000) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Maximum 100 votes allowed. Please enter a valid number:",
        "MSGTYPE": true
      };
    }

    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;
    transactionData.vote_count = voteCount;
    transactionData.amount = voteCount; // GHS1 per vote

    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: {
        menuState: 'CONFIRM_VOTE_PAYMENT',
        prevMenuState: 'ENTER_VOTE_COUNT',
        transactionData: JSON.parse(JSON.stringify(transactionData))
      }
    });

    return {
      "USERID": session.userId,
      "MSISDN": session.msisdn,
      "USERDATA": session.userData,
      "MSG":`Confirm Vote for Candidate: ${transactionData.candidate_name}\nVotes: ${voteCount} = Amount: GHS${voteCount}\n1. Confirm\n2. Cancel`,
      "MSGTYPE": true
    };
  }

  private async handleConfirmVotePayment(input: string, session: UssdSession): Promise<UssdResponse> {
    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;
    // console.log("Transaction Data:", transactionData);
    // console.log("Session Data:", session);

    switch (input) {
      case '1':
        await prisma.ussdSession.update({
          where: { sessionId: session.sessionId },
          data: {
            menuState: 'ENTER_MOMO_PIN',
            prevMenuState: 'CONFIRM_VOTE_PAYMENT'
          }
        });

        const vote = await prisma.vote.create({
          data: {
            candidateId: transactionData.candidate_id || 0,
            voterPhone: session.msisdn,
            numberOfVotes: transactionData.vote_count || 0,
            amountPaid: transactionData.amount || 0,
            transactionId: this.generateTransactionId(session.sessionId),
            transactionStatus: 'pending',
            sessionId: session.sessionId
          }
        });

        setTimeout(async () => {
          await paymentService.processVotePayment(session, vote)
            .catch(async (error) => {
              console.error('Payment error:', error);

              await prisma.vote.update({
                where: { id: vote.id },
                data: {
                  transactionStatus: 'failed',
                  transactionMessage: 'Payment processing failed'
                }
              });

            });
        }, 2000);

        return {
          "USERID": session.userId,
          "MSISDN": session.msisdn,
          "USERDATA": session.userData,
          "MSG": `You will receive a notification to confirm payment or dial ${session.network === 'MTN' ? '*170#' : '*110#'} to approve payment.`,
          "MSGTYPE": false
        };
      case '2':
        return this.endSession('Vote cancelled', session);

      default:
        return this.endSession('Invalid selection', session);
    }
  }

  private async handleEnterMomoPin(input: string, session: UssdSession): Promise<UssdResponse> {

    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;

    // Create vote record
    const vote = await prisma.vote.create({
      data: {
        candidateId: transactionData.candidate_id || 0,
        voterPhone: session.msisdn,
        numberOfVotes: transactionData.vote_count || 0,
        amountPaid: transactionData.amount || 0,
        transactionId: this.generateTransactionId(session.sessionId),
        transactionStatus: 'pending',
        sessionId: session.sessionId
      }
    });

    // Process payment
    try {
      await paymentService.processVotePayment(session, vote);

      return this.endSession('Payment processing initiated. You will receive a confirmation shortly.');
    } catch (error) {
      console.error('Payment error:', error);

      // Update vote status to failed
      await prisma.vote.update({
        where: { id: vote.id },
        data: {
          transactionStatus: 'failed',
          transactionMessage: 'Payment processing failed'
        }
      });

      return this.endSession('Payment failed. Please try again later.');
    }
  }

  private async handleDonateFlow(input: string, session: UssdSession): Promise<UssdResponse> {
    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: {
        menuState: 'ENTER_DONATION_AMOUNT',
        prevMenuState: 'DONATE_FLOW'
      }
    });

    return {
      "USERID": session.userId,
      "MSISDN": session.msisdn,
      "USERDATA": session.userData,
      "MSG": "Enter donation amount (GHS):",
      "MSGTYPE": true
    };
  }

  private async handleEnterDonationAmount(input: string, session: UssdSession): Promise<UssdResponse> {
    const amount = parseFloat(input.trim());

    if (isNaN(amount) || amount <= 0) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Invalid amount. Please enter a valid donation amount (GHS):",
        "MSGTYPE": true
      };
    }

    if (amount > 100000) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": "Maximum donation amount is GHS1000. Please enter a valid amount:",
        "MSGTYPE": true
      };
    }

    const transactionData = (session.transactionData as unknown as TransactionData) || {} as TransactionData;
    transactionData.donation_amount = amount;

    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: {
        menuState: 'CONFIRM_DONATION',
        prevMenuState: 'ENTER_DONATION_AMOUNT',
        transactionData: JSON.parse(JSON.stringify(transactionData))
      }
    });

    return {
      "USERID": session.userId,
      "MSISDN": session.msisdn,
      "USERDATA": session.userData,
      "MSG": `Confirm Donation:\nAmount: GHS${amount}\n\n1. Confirm\n2. Cancel`,
      "MSGTYPE": true
    };
  }

  private async handleConfirmDonation(input: string, session: UssdSession): Promise<UssdResponse> {

    switch (input) {
      case '1':
        // Process donation payment
        try {
        setTimeout(async () => {
          await paymentService.processDonationPayment(session)
        }, 2000);
          return this.endSession("You will receive a notification to confirm payment or dial *170# or *110# to approve payment.\n Thank you for your donation.");
        } catch (error) {
          console.error('Donation error:', error);
          return this.endSession('Donation failed. Please try again later.');
        }

      case '2':
        return this.endSession('Donation cancelled');

      default:
        return {
          "USERID": session.userId,
          "MSISDN": session.msisdn,
          "USERDATA": session.userData,
          "MSG": "Invalid selection. Please choose:\n1. Confirm  \n2. Cancel",
          "MSGTYPE": true
        };
    }
  }

  private async handleBackNavigation(session: UssdSession): Promise<UssdResponse> {
    if (!session.prevMenuState) {
      return this.mainMenu(session);
    }

    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: { menuState: session.prevMenuState }
    });

    switch (session.prevMenuState) {
      case 'MAIN_MENU':
        return this.mainMenu(session);
      case 'ENTER_GROUP_CODE':
        return {
          "USERID": session.userId,
          "MSISDN": session.msisdn,
          "USERDATA": session.userData,
          "MSG": "CON Enter group code number:",
          "MSGTYPE": true
        };
      default:
        return this.mainMenu(session);
    }
  }

  private endSession(message: string, session?: UssdSession): UssdResponse {
    if (session) {
      return {
        "USERID": session.userId,
        "MSISDN": session.msisdn,
        "USERDATA": session.userData,
        "MSG": `${message}`,
        "MSGTYPE": false
      };
    }
    return {
      "USERID": "",
      "MSISDN": "",
      "USERDATA": "",
      "MSG": `${message}`,
      "MSGTYPE": false
    };
  }

  private generateTransactionId(sessionId: string): string {
    const sessionPart = sessionId.toString().slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return (sessionPart + timestamp + randomPart).slice(0, 14);
  }
}

export const ussdService = new UssdService();
