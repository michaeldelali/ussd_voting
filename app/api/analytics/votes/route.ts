import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/models';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const candidateId = searchParams.get('candidateId');

    // Build where conditions
    const whereConditions: any = {
      transactionStatus: 'success'
    };

    if (startDate && endDate) {
      whereConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (candidateId) {
      whereConditions.candidateId = parseInt(candidateId);
    }

    // Get vote analytics with candidate information
    const voteAnalytics = await prisma.vote.groupBy({
      by: ['candidateId'],
      where: whereConditions,
      _sum: {
        numberOfVotes: true,
        amountPaid: true
      },
      _count: {
        id: true
      }
    });

    // Get candidate details for the results
    const candidateIds = voteAnalytics.map(v => v.candidateId);
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds }
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    // Calculate total votes for percentage calculation
    const totalVotes = voteAnalytics.reduce((sum, item) => {
      return sum + (item._sum.numberOfVotes || 0);
    }, 0);

    // Format response with percentages
    const formattedAnalytics = voteAnalytics.map((item) => {
      const votes = item._sum.numberOfVotes || 0;
      const amount = Number(item._sum.amountPaid || 0);
      const transactionCount = item._count.id || 0;
      const candidate = candidateMap.get(item.candidateId);

      return {
        candidate_id: item.candidateId,
        candidate_name: candidate?.name || 'Unknown',
        candidate_code: candidate?.code || 'N/A',
        total_votes: votes,
        total_amount: amount,
        transaction_count: transactionCount,
        vote_percentage: totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : '0.00'
      };
    });

    // Sort by total votes descending
    formattedAnalytics.sort((a, b) => b.total_votes - a.total_votes);

    return NextResponse.json({
      analytics: formattedAnalytics,
      summary: {
        total_votes: totalVotes,
        total_candidates: formattedAnalytics.length,
        total_amount: formattedAnalytics.reduce((sum, item) => sum + item.total_amount, 0),
        total_transactions: formattedAnalytics.reduce((sum, item) => sum + item.transaction_count, 0)
      }
    });

  } catch (error) {
    console.error('Vote analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote analytics' },
      { status: 500 }
    );
  }
}