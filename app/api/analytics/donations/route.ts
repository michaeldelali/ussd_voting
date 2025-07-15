import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/models';
import { Prisma } from '@prisma/client';

interface DailyDonation {
  date: Date;
  daily_amount: bigint | number;
  daily_count: bigint | number;
}

// Helper function to convert BigInt and Decimal to number safely
function bigIntToNumber(value: bigint | number | Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'bigint') return Number(value);
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where conditions
    const whereConditions: Prisma.DonationWhereInput = {
      transactionStatus: 'success'
    };

    if (startDate && endDate) {
      whereConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get donation analytics using Prisma aggregations
    const donationStats = await prisma.donation.aggregate({
      where: whereConditions,
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      },
      _avg: {
        amount: true
      }
    });

    // Get unique donors count
    const uniqueDonorsCount = await prisma.donation.groupBy({
      by: ['donorPhone'],
      where: whereConditions,
      _count: {
        donorPhone: true
      }
    });

    // Get donation trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyDonations = await prisma.$queryRaw<DailyDonation[]>`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as daily_amount,
        COUNT(id) as daily_count
      FROM donations 
      WHERE transaction_status = 'success' 
        AND created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Get recent successful donations
    const recentDonations = await prisma.donation.findMany({
      select: {
        amount: true,
        createdAt: true,
        donorPhone: true
      },
      where: {
        transactionStatus: 'success'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Convert dailyDonations BigInt values to numbers
    const processedDailyDonations = dailyDonations.map(donation => ({
      date: donation.date,
      daily_amount: bigIntToNumber(donation.daily_amount),
      daily_count: bigIntToNumber(donation.daily_count)
    }));

    // Mask phone numbers for privacy and convert BigInt amounts
    const maskedRecentDonations = recentDonations.map(donation => ({
      amount: bigIntToNumber(donation.amount),
      createdAt: donation.createdAt,
      donor_phone: maskPhoneNumber(donation.donorPhone)
    }));

    return NextResponse.json({
      summary: {
        total_amount: bigIntToNumber(donationStats._sum?.amount) || 0,
        total_donations: bigIntToNumber(donationStats._count?._all) || 0,
        unique_donors: uniqueDonorsCount.length || 0,
        average_donation: bigIntToNumber(donationStats._avg?.amount) || 0
      },
      trends: processedDailyDonations,
      recent_donations: maskedRecentDonations
    });

  } catch (error: unknown) {
    console.error('Donation analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch donation analytics', details: errorMessage },
      { status: 500 }
    );
  }
}

function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
}