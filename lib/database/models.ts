import { prisma } from './prisma'

export { prisma }

export type {
  User,
  Candidate,
  Vote,
  Donation,
  UssdSession,
  TransactionStatus
} from '@prisma/client'

export default prisma