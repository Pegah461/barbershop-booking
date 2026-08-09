-- Prevents double-booking at the database layer — a hard guard that rejects any
-- INSERT or UPDATE that would create a PENDING or CONFIRMED booking whose
-- [startsAt, endsAt) range overlaps with an existing one.
--
-- Prisma stores DateTime as TIMESTAMP(3) (without time zone), so we use tsrange
-- (not tstzrange). All values are written as UTC by the application, so the
-- constraint is still timezone-correct despite the unzoned column type.
-- btree_gist is required to allow mixing btree and gist operators in one
-- EXCLUDE constraint.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT "booking_no_overlap"
  EXCLUDE USING gist (
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));