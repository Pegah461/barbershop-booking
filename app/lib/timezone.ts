// IANA identifier for Solomon Islands Time (UTC+11, no DST). The shop is in
// Honiara on Guadalcanal.
//
// Booking instants are stored in the database as absolute UTC. This constant
// is used in exactly two ways: to interpret the "HH:mm" strings in
// BusinessHours when generating slots, and to render stored instants back as
// shop-local wall-clock time. Changing it moves generated slots, not stored
// rows.
//
// Kept in its own module (no server-only imports) so Client Components can
// import it without pulling in the Prisma/pg client.
export const SHOP_TZ = "Pacific/Guadalcanal"
