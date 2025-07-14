import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let transactions: any[] = [];
    let totalCount = 0;

    // Build where conditions
    const whereConditions: any = {};
    if (status && status !== 'all') {
      whereConditions.transactionStatus = status;
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
        where: whereConditions,
        take: type === 'votes' ? limit : Math.ceil(limit / 2),
        skip: type === 'votes' ? offset : 0,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get count for votes
      const voteCount = await prisma.vote.count({
        where: whereConditions
      });

      const voteTransactions = voteQuery.map(vote => ({
        id: vote.id,
        type: 'vote',
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
        where: whereConditions,
        take: type === 'donations' ? limit : Math.ceil(limit / 2),
        skip: type === 'donations' ? offset : 0,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get count for donations
      const donationCount = await prisma.donation.count({
        where: whereConditions
      });

      const donationTransactions = donationQuery.map(donation => ({
        id: donation.id,
        type: 'donation',
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
        prisma.vote.count({ where: whereConditions }),
        prisma.donation.count({ where: whereConditions })
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

  } catch (error) {
    console.error('Transaction analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
}