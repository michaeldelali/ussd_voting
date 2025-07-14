import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/models';
import { Prisma} from '@prisma/client';

interface TransactionItem {
  id: number;
  type: 'vote' | 'donation';
  phone: string;
  candidate_name: string | null;
  candidate_code: string | null;
  votes: number | null;
  amount: number;
  status: string;
  transaction_id: string | null;
  message: string | null;
  created_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let transactions: TransactionItem[] = [];
    let totalCount = 0;

    // Build where conditions for votes and donations
    const voteWhereConditions: Prisma.VoteWhereInput = {};
    const donationWhereConditions: Prisma.DonationWhereInput = {};
    
    if (status && status !== 'all') {
      // Safe type assertion - status comes from query params and should match TransactionStatus enum
      (voteWhereConditions as unknown as Record<string, unknown>).transactionStatus = status;
      (donationWhereConditions as unknown as Record<string, unknown>).transactionStatus = status;
    }

    if (!type || type === 'all' || type === 'votes') {
      // Get vote transactions with candidate info
      const voteQuery = await prisma.vote.findMany({
        include: {
          candidate: {
            select: {
              name: true,
              code: true
            }
          }
        },
        where: voteWhereConditions,
        take: type === 'votes' ? limit : Math.ceil(limit / 2),
        skip: type === 'votes' ? offset : 0,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get count for votes
      const voteCount = await prisma.vote.count({
        where: voteWhereConditions
      });

      const voteTransactions: TransactionItem[] = voteQuery.map(vote => ({
        id: vote.id,
        type: 'vote' as const,
        phone: maskPhoneNumber(vote.voterPhone),
        candidate_name: vote.candidate?.name || 'Unknown',
        candidate_code: vote.candidate?.code || 'N/A',
        votes: vote.numberOfVotes,
        amount: Number(vote.amountPaid),
        status: vote.transactionStatus,
        transaction_id: vote.transactionId,
        message: vote.transactionMessage,
        created_at: vote.createdAt
      }));

      transactions = [...transactions, ...voteTransactions];
      if (type === 'votes') {
        totalCount = voteCount;
      }
    }

    if (!type || type === 'all' || type === 'donations') {
      // Get donation transactions
      const donationQuery = await prisma.donation.findMany({
        where: donationWhereConditions,
        take: type === 'donations' ? limit : Math.ceil(limit / 2),
        skip: type === 'donations' ? offset : 0,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get count for donations
      const donationCount = await prisma.donation.count({
        where: donationWhereConditions
      });

      const donationTransactions: TransactionItem[] = donationQuery.map(donation => ({
        id: donation.id,
        type: 'donation' as const,
        phone: maskPhoneNumber(donation.donorPhone),
        candidate_name: null,
        candidate_code: null,
        votes: null,
        amount: Number(donation.amount),
        status: donation.transactionStatus,
        transaction_id: donation.transactionId,
        message: donation.transactionMessage,
        created_at: donation.createdAt
      }));

      transactions = [...transactions, ...donationTransactions];
      if (type === 'donations') {
        totalCount = donationCount;
      }
    }

    // If getting all types, we need to sort and paginate manually
    if (!type || type === 'all') {
      // Sort all transactions by date
      transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Get total count for all types
      const [voteCount, donationCount] = await Promise.all([
        prisma.vote.count({ where: voteWhereConditions }),
        prisma.donation.count({ where: donationWhereConditions })
      ]);
      totalCount = voteCount + donationCount;

      // Apply pagination
      transactions = transactions.slice(offset, offset + limit);
    }

    return NextResponse.json({
      transactions,
      pagination: {
        current_page: page,
        per_page: limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Transaction analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: errorMessage },
      { status: 500 }
    );
  }
}

function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
}