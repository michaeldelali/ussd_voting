import axios from 'axios';
import { prisma, type UssdSession, type Vote, type Donation } from '../database/models';

export class PaymentService {
  private generateUniqueNumber(sessionId: string): string {
    const sessionPart = sessionId.toString().slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return (sessionPart + timestamp + randomPart).slice(0, 14);
  }

  async processVotePayment(session: UssdSession, vote: Vote): Promise<void> {
    const encodedCredentials = Buffer.from(
      `${process.env.PAYMENT_API_NAME}:${process.env.PAYMENT_API_KEY_PRO}`
    ).toString('base64');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedCredentials}`,
      'Cache-Control': 'no-cache',
      'request-id': session.sessionId
    };

    const transactionData = session.transactionData as any || {};

    const paymentData = {
      amount: transactionData.amount.toString(),
      processing_code: "000200",
      transaction_id: this.generateUniqueNumber(session.sessionId),
      desc: `Vote payment for Borbor Carnival 25 - ${transactionData.candidate_name}`,
      merchant_id: process.env.MERCHANT_ID,
      subscriber_number: session.msisdn,
      "r-switch": session.network,
      callback_url: process.env.PAYMENT_CALLBACK_URL,
      reference: "Borbor Carnival 25 Vote",
      merchant_data: JSON.stringify({
        session_id: session.sessionId,
        vote_id: vote.id,
        type: 'vote',
        vote_quantity: transactionData.vote_count,
        candidate_name: transactionData.candidate_name,
      })
    };

    console.log('Processing vote payment:', paymentData);

    try {
      const response = await axios.post(
        process.env.PAYMENT_URL_PROD!,
        paymentData,
        { headers }
      );

      if (response.status === 200) {
        console.log('Vote payment request successful:', response.data);
        
        // Update vote with transaction details
        await prisma.vote.update({
          where: { id: vote.id },
          data: {
            transactionId: paymentData.transaction_id,
            transactionMessage: 'Payment request sent successfully'
          }
        });
        return response.data;

      } else {
        throw new Error(`Payment failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Vote payment error:', error.response?.data || error.message);
      throw error;
    }
  }

  async processDonationPayment(session: UssdSession): Promise<void> {
    const encodedCredentials = Buffer.from(
      `${process.env.PAYMENT_API_NAME}:${process.env.PAYMENT_API_KEY_PRO}`
    ).toString('base64');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedCredentials}`,
      'Cache-Control': 'no-cache',
      'request-id': session.sessionId
    };

    const transactionData = session.transactionData as any || {};
    const transactionId = this.generateUniqueNumber(session.sessionId);

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        donorPhone: session.msisdn,
        amount: transactionData.donation_amount,
        transactionId: transactionId,
        transactionStatus: 'pending',
        sessionId: session.sessionId
      }
    });

    const paymentData = {
      amount: transactionData.donation_amount.toString(),
      processing_code: "000200",
      transaction_id: transactionId,
      desc: "Donation for Borbor Carnival 25",
      merchant_id: process.env.MERCHANT_ID,
      subscriber_number: session.msisdn,
      "r-switch": session.network,
      callback_url: process.env.PAYMENT_CALLBACK_URL,
      reference: "Borbor Carnival 25 Donation",
      merchant_data: JSON.stringify({
        session_id: session.sessionId,
        donation_id: donation.id,
        type: 'donation'
      })
    };

    console.log('Processing donation payment:', paymentData);

    try {
      const response = await axios.post(
        process.env.PAYMENT_URL_PROD!,
        paymentData,
        { headers }
      );

      if (response.status === 200) {
        console.log('Donation payment request successful:', response.data);
        
        // Update donation with transaction details
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            transactionMessage: 'Payment request sent successfully'
          }
        });
      } else {
        throw new Error(`Payment failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Donation payment error:', error.response?.data || error.message);
      
      // Update donation status to failed
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          transactionStatus: 'failed',
          transactionMessage: 'Payment processing failed'
        }
      });
      
      throw error;
    }
  }

  async handlePaymentCallback(callbackData: any): Promise<void> {
    try {
      console.log('Payment callback received:', callbackData);

      const merchantData = JSON.parse(callbackData.merchant_data || '{}');
      const transactionStatus = callbackData.status || callbackData.transaction_status;
      
      if (merchantData.type === 'vote' && merchantData.vote_id) {
        const vote = await prisma.vote.findUnique({
          where: { id: merchantData.vote_id }
        });
        
        if (vote) {
          await prisma.vote.update({
            where: { id: vote.id },
            data: {
              transactionStatus: transactionStatus === 'success' ? 'success' : 'failed',
              transactionMessage: callbackData.message || callbackData.description || 'Payment processed'
            }
          });
          
          console.log(`Vote payment updated: ${vote.id} - ${transactionStatus}`);
                  // Send SMS notifications
        axios.post('https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/', {
          "key": process.env.SMS_API_KEY,
          "msisdn": callbackData.subscriber_number,
          "message": `Thank you for voting ${merchantData?.vote_quantity} times for ${merchantData?.candidate_name}.`,
          "sender_id": "Borborbor"
        }).then((response) => {
          console.log('SMS sent:', response.data);

          // Send admin notification
          axios.post('https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/', {
            "key": process.env.SMS_API_KEY,
            "msisdn": process.env.ADMIN_PHONE_NUMBER,
            "message": `Vote payment successful: ${merchantData?.vote_quantity} votes for ${merchantData?.candidate_name} from ${callbackData?.subscriber_number} - Amount: GHS${callbackData?.total_amount}`,
            "sender_id": "Borborbor"
          }).then((response) => {
            console.log('Admin SMS sent:', response.data);
          }).catch((error) => {
            console.error('Error sending admin SMS:', error);
          });
        }).catch((error) => {
          console.error('Error sending SMS:', error);
        });

        }
      } else if (merchantData.type === 'donation' && merchantData.donation_id) {
        const donation = await prisma.donation.findUnique({
          where: { id: merchantData.donation_id }
        });
        
        if (donation) {
          await prisma.donation.update({
            where: { id: donation.id },
            data: {
              transactionStatus: transactionStatus === 'success' ? 'success' : 'failed',
              transactionMessage: callbackData.message || callbackData.description || 'Payment processed'
            }
          });
          
          console.log(`Donation payment updated: ${donation.id} - ${transactionStatus}`);
                            // Send SMS notifications
        axios.post('https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/', {
          "key": process.env.SMS_API_KEY,
          "msisdn": callbackData.subscriber_number,
          "message": `Thank you for donating ${callbackData?.total_amount} to Borborbor Carnival 25.`,
          "sender_id": "Borborbor"
        }).then((response) => {
          console.log('SMS sent:', response.data);

          // Send admin notification
          axios.post('https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/', {
            "key": process.env.SMS_API_KEY,
            "msisdn": process.env.ADMIN_PHONE_NUMBER,
            "message": `Donation by: ${callbackData?.subscriber_number}. Amount dated ${callbackData?.total_amount}`,
            "sender_id": "Borborbor"
          }).then((response) => {
            console.log('Admin SMS sent:', response.data);
          }).catch((error) => {
            console.error('Error sending admin SMS:', error);
          });
        }).catch((error) => {
          console.error('Error sending SMS:', error);
        });
        }
      }
    } catch (error) {
      console.error('Payment callback processing error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();