export {
  profilesCollection,
  missionariesCollection,
  donorsCollection,
  postsCollection,
  postCommentsCollection,
  donationsCollection,
  fundsCollection,
  followsCollection,
  getQueryClient,
  setQueryClient,
} from './collections'

export type {
  Profile,
  Missionary,
  Donor,
  Post,
  PostComment,
  Donation,
  Fund,
  Follow,
} from './collections'

export {
  usePostsWithAuthors,
  usePostsForFollowedMissionaries,
  useDonorGivingHistory,
  useMissionarySupporters,
  useCommentsWithAuthors,
  useFundsWithProgress,
  useMissionaryDashboard,
  useMissionaryStats,
} from './hooks'

export { TanStackDBProvider } from './provider'
