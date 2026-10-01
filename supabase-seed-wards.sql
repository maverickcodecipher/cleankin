-- =============================================================
-- CleanKin · Wards seed (Greater Chennai Corporation)
-- 15 zones · 200 wards · TVK district in-charge per zone
-- Run in Supabase SQL editor. Re-runnable (clears + reseeds).
--
-- In-charge sources (public):
--   TVK org structure ......... thamizhagavettrikazhagam.com/organization.php
--   District secretaries ...... TVK announcements Mar 2025 (public lists)
--   Seat cross-check .......... tvkvijay.com/en/election-candidates/tamilnadu
--   Zones/wards ............... Greater Chennai Corporation, chennai.nic.in
-- Zone→party-district mapping is CleanKin editorial (confirmed seats:
-- Ambattur→East, TVK Nagar→North, Royapuram→South(South),
-- Virugambakkam→South(West), Shozhinganallur→Suburban).
-- =============================================================

delete from wards;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 1, 'Thiruvottiyur', 'Thiruvottiyur · Ward ' || g, 'V. Siva', 'TVK · Chennai North North' from generate_series(1,14) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 2, 'Manali', 'Manali · Ward ' || g, 'G. Velu', 'TVK · Chennai Northeast' from generate_series(15,21) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 3, 'Madhavaram', 'Madhavaram · Ward ' || g, 'N. Thanigasalam', 'TVK · Chennai Northwest' from generate_series(22,33) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 4, 'Tondiarpet', 'Tondiarpet · Ward ' || g, 'K. Vijayaragavan', 'TVK · Chennai North South' from generate_series(34,48) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 5, 'Royapuram', 'Royapuram · Ward ' || g, 'K. Vijay Dhamu', 'TVK · Chennai South South' from generate_series(49,63) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 6, 'Thiru-Vi-Ka Nagar', 'Thiru-Vi-Ka Nagar · Ward ' || g, 'M.R. Pallavi', 'TVK · Chennai North' from generate_series(64,78) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 7, 'Ambattur', 'Ambattur · Ward ' || g, 'G. Balamurugan', 'TVK · Chennai East' from generate_series(79,93) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 8, 'Anna Nagar', 'Anna Nagar · Ward ' || g, 'S.K.M. Kumar', 'TVK · Chennai Central' from generate_series(94,108) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 9, 'Teynampet', 'Teynampet · Ward ' || g, 'R. Dilip Kumar', 'TVK · Chennai Central South' from generate_series(109,126) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 10, 'Kodambakkam', 'Kodambakkam · Ward ' || g, 'R. Sabarinathan', 'TVK · Chennai South West' from generate_series(127,142) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 11, 'Valasaravakkam', 'Valasaravakkam · Ward ' || g, 'A.S. Palani', 'TVK · Chennai Central West' from generate_series(143,155) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 12, 'Alandur', 'Alandur · Ward ' || g, 'K. Appunu (Velmurugan)', 'TVK · Chennai South North' from generate_series(156,167) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 13, 'Adyar', 'Adyar · Ward ' || g, 'P. Saravanamoorthy', 'TVK · Chennai Suburban' from generate_series(170,182) g;

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 14, 'Perungudi', 'Perungudi · Ward ' || g, 'P. Saravanamoorthy', 'TVK · Chennai Suburban' from generate_series(183,191) g;

-- Zone 14 also covers wards 168,169 (GCC layout)
insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party) values
(168, 14, 'Perungudi', 'Perungudi · Ward 168', 'P. Saravanamoorthy', 'TVK · Chennai Suburban'),
(169, 14, 'Perungudi', 'Perungudi · Ward 169', 'P. Saravanamoorthy', 'TVK · Chennai Suburban');

insert into wards (ward_number, zone_number, zone_name, locality_name, incharge_name, incharge_party)
select g, 15, 'Sholinganallur', 'Sholinganallur · Ward ' || g, 'P. Saravanamoorthy', 'TVK · Chennai Suburban' from generate_series(192,200) g;
