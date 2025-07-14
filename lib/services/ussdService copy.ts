import { prisma, type UssdSession } from '../database/models';
import { paymentService } from './paymentService';

export class UssdService {
  async processInput(
    sessionId: string,
    userId: string,
    msisdn: string,
    userData: string,
    msgType: string,
    network: string
  ): Promise<string> {
    let session = await prisma.ussdSession.findUnique({
      where: { sessionId }
    });
    const input = userData;

    // Initialize new session
    if (!session) {
      session = await prisma.ussdSession.create({
        data: {
          sessionId: sessionId,
          msisdn: msisdn,
          menuState: 'MAIN_MENU',
          network: network,
          msgType: msgType,
          userId: userId,
          userData: userData,
          transactionData: {}
        }
      });
      return this.mainMenu();
    }

    // Handle back to main menu
    if (input === '0') {
      await prisma.ussdSession.update({
        where: { sessionId },
        data: { menuState: 'MAIN_MENU' }
      });
      return this.mainMenu();
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
        return this.endSession('Invalid selection');
    }
  }

  private mainMenu(): string {
    return `CON Welcome to Borbor Carnival 25
1. Vote
2. Donate`;
  }

  private async handleMainMenu(input: string, session: UssdSession): Promise<string> {
    const transactionData = session.transactionData as any || {};

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
        return `CON Enter group code number:`;

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
        return this.endSession('Invalid selection');
    }
  }

  private async handleEnterGroupCode(input: string, session: UssdSession): Promise<string> {
    const groupCode = input.trim();
    
    if (!groupCode) {
      return `CON Invalid code. Please try again:`;
    }

    // Validate group code
    const candidate = await prisma.candidate.findFirst({
      where: { 
        code: groupCode, 
        isActive: true 
      }
    });

    if (!candidate) {
      return `CON Invalid code. Please try again:`;
    }

    // Store candidate in session
    const transactionData = session.transactionData as any || {};
    transactionData.candidate_id = candidate.id;
    transactionData.candidate_name = candidate.name;
    transactionData.candidate_code = candidate.code;
    
    await prisma.ussdSession.update({
      where: { sessionId: session.sessionId },
      data: {
        menuState: 'ENTER_VOTE_COUNT',
        prevMenuState: 'ENTER_GROUP_CODE',
        transactionData: transactionData
      }
    });

    return `CON You have selected: ${candidate.name}
Enter number of votes (GH₵1 per vote):`;
  }

  private async handleEnterVoteCount(input: string, session: UssdSession): Promise<string> {
    const voteCount = parseInt(input.trim());
    
    if (isNaN(voteCount) || voteCount <= 0) {
      return `CON Invalid number. Please enter a valid number of votes:`;
    }

    if (voteCount > 100) {
      return `CON Maximum 100 votes allowed. Please enter a valid number:`;
    }

    let transactionData = session.transaction_data || {};
    transactionData.vote_count = voteCount;
    transactionData.amount = voteCount; // GH₵1 per vote
    
    session.menu_state = 'CONFIRM_VOTE_PAYMENT';
    session.prev_menu_state = 'ENTER_VOTE_COUNT';
    session.transaction_data = transactionData;
    await session.save();

    return `CON Confirm Payment:
Candidate: ${transactionData.candidate_name}
Votes: ${voteCount}
Amount: GH₵${voteCount}

1. Confirm
2. Cancel`;
  }

  private async handleConfirmVotePayment(input: string, session: UssdSession): Promise<string> {
    const transactionData = session.transaction_data || {};

    switch (input) {
      case '1':
        session.menu_state = 'ENTER_MOMO_PIN';
        session.prev_menu_state = 'CONFIRM_VOTE_PAYMENT';
        await session.save();
        return `CON Enter your Mobile Money PIN to authorize payment of GH₵${transactionData.amount}:`;

      case '2':
        return this.endSession('Transaction cancelled');

      default:
        return `CON Invalid selection. Please choose:
1. Confirm
2. Cancel`;
    }
  }

  private async handleEnterMomoPin(input: string, session: UssdSession): Promise<string> {
    const pin = input.trim();
    
    if (!pin || pin.length < 4) {
      return `CON Invalid PIN. Please enter your Mobile Money PIN:`;
    }

    const transactionData = session.transaction_data || {};
    
    // Create vote record
    const vote = await Vote.create({
      candidate_id: transactionData.candidate_id,
      voter_phone: session.msisdn,
      number_of_votes: transactionData.vote_count,
      amount_paid: transactionData.amount,
      transaction_id: this.generateTransactionId(session.session_id),
      transaction_status: 'pending',
      session_id: session.session_id
    });

    // Process payment
    try {
      await paymentService.processVotePayment(session, vote, pin);
      
      return `CON Payment request sent. You will receive an SMS confirmation shortly.

Thank you for voting ${transactionData.vote_count} time(s) for the ${transactionData.candidate_name}.`;
    } catch (error) {
      console.error('Payment error:', error);
      
      // Update vote status to failed
      await vote.update({ 
        transaction_status: 'failed',
        transaction_message: 'Payment processing failed'
      });
      
      return this.endSession('Payment failed. Please try again later.');
    }
  }

  private async handleDonateFlow(input: string, session: UssdSession): Promise<string> {
    session.menu_state = 'ENTER_DONATION_AMOUNT';
    session.prev_menu_state = 'DONATE_FLOW';
    await session.save();
    
    return `CON Enter donation amount (GH₵):`;
  }

  private async handleEnterDonationAmount(input: string, session: UssdSession): Promise<string> {
    const amount = parseFloat(input.trim());
    
    if (isNaN(amount) || amount <= 0) {
      return `CON Invalid amount. Please enter a valid donation amount (GH₵):`;
    }

    if (amount > 1000) {
      return `CON Maximum donation amount is GH₵1000. Please enter a valid amount:`;
    }

    let transactionData = session.transaction_data || {};
    transactionData.donation_amount = amount;
    
    session.menu_state = 'CONFIRM_DONATION';
    session.prev_menu_state = 'ENTER_DONATION_AMOUNT';
    session.transaction_data = transactionData;
    await session.save();

    return `CON Confirm Donation:
Amount: GH₵${amount}

1. Confirm
2. Cancel`;
  }

  private async handleConfirmDonation(input: string, session: UssdSession): Promise<string> {
    const transactionData = session.transaction_data || {};

    switch (input) {
      case '1':
        // Process donation payment
        try {
          await paymentService.processDonationPayment(session);
          
          return this.endSession(`Thank you for your donation of GH₵${transactionData.donation_amount} to Borbor Carnival 25!`);
        } catch (error) {
          console.error('Donation error:', error);
          return this.endSession('Donation failed. Please try again later.');
        }

      case '2':
        return this.endSession('Donation cancelled');

      default:
        return `CON Invalid selection. Please choose:
1. Confirm
2. Cancel`;
    }
  }

  private async handleBackNavigation(session: UssdSession): Promise<string> {
    if (!session.prev_menu_state) {
      return this.mainMenu();
    }

    session.menu_state = session.prev_menu_state;
    await session.save();

    switch (session.prev_menu_state) {
      case 'MAIN_MENU':
        return this.mainMenu();
      case 'ENTER_GROUP_CODE':
        return `CON Enter group code number:`;
      default:
        return this.mainMenu();
    }
  }

  private endSession(message: string): string {
    return `END ${message}`;
  }

  private generateTransactionId(sessionId: string): string {
    const sessionPart = sessionId.toString().slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return (sessionPart + timestamp + randomPart).slice(0, 14);
  }
}

export const ussdService = new UssdService();