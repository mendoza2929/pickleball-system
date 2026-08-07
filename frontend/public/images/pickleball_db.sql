-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 07, 2026 at 06:30 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pickleball_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `courts`
--

CREATE TABLE `courts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `court_number` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `surface_type` enum('Indoor','Outdoor','Synthetic','Concrete') NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('Available','Maintenance','Inactive') DEFAULT 'Available',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `courts`
--

INSERT INTO `courts` (`id`, `uuid`, `court_number`, `name`, `description`, `surface_type`, `hourly_rate`, `status`, `is_deleted`, `created_at`, `updated_at`) VALUES
(1, '58e048ca-b867-4e8a-920d-3ca2473fb0a4', 1, 'Court Alpha', 'Renovated Indoor Court', 'Indoor', '450.00', 'Available', 0, '2026-08-07 04:56:07', '2026-08-07 05:09:21'),
(2, 'cb76c790-3280-4e3b-b64e-e6bbf82494ed', 2, 'Court BETA', 'Renovated Indoor Court', 'Indoor', '200.00', 'Available', 0, '2026-08-07 04:58:46', '2026-08-07 04:58:46'),
(4, 'dc20e21c-bdbb-4033-99e6-afeabfac5822', 3, 'Court 1', 'Professional indoor pickleball court', 'Indoor', '250.00', 'Available', 0, '2026-08-07 14:16:11', '2026-08-07 14:16:11');

-- --------------------------------------------------------

--
-- Table structure for table `court_schedules`
--

CREATE TABLE `court_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `court_id` bigint(20) UNSIGNED NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `is_closed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `court_schedules`
--

INSERT INTO `court_schedules` (`id`, `uuid`, `court_id`, `day_of_week`, `open_time`, `close_time`, `is_closed`, `created_at`, `updated_at`) VALUES
(1, 'f6e1b422-7fa3-4be5-a80f-6cd76ba038b9', 4, 'Saturday', '08:00:00', '20:00:00', 0, '2026-08-07 15:07:55', '2026-08-07 15:07:55'),
(2, 'f1a68594-0883-407b-8294-71becbef3780', 4, 'Sunday', '08:00:00', '20:00:00', 0, '2026-08-07 15:30:46', '2026-08-07 15:40:35');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `payment_no` varchar(30) NOT NULL,
  `reservation_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('Cash','GCash','Maya','Credit Card') NOT NULL,
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `reference_no` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `uuid`, `payment_no`, `reservation_id`, `amount`, `payment_method`, `payment_status`, `reference_no`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, '1b1fe3a6-baf4-4262-9371-2f232b144758', 'PAY-20260807-815322', 1, '900.00', 'Cash', 'Paid', NULL, '2026-08-07 14:28:32', '2026-08-07 06:28:10', '2026-08-07 06:28:32');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `reservation_no` varchar(30) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guest_name` varchar(150) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `guest_phone` varchar(30) DEFAULT NULL,
  `court_id` bigint(20) UNSIGNED NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `total_hours` decimal(5,2) NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `reservation_status` enum('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
  `payment_status` enum('Unpaid','Partial','Paid') DEFAULT 'Unpaid',
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `uuid`, `reservation_no`, `user_id`, `guest_name`, `guest_email`, `guest_phone`, `court_id`, `reservation_date`, `start_time`, `end_time`, `total_hours`, `hourly_rate`, `total_amount`, `reservation_status`, `payment_status`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 'd8e7a10f-a369-4abb-b289-66e77c9c0eae', 'RSV-20260807-000001', 1, NULL, NULL, NULL, 1, '2026-08-10', '08:00:00', '10:00:00', '2.00', '450.00', '900.00', 'Confirmed', 'Paid', 'Morning practice', '2026-08-07 05:09:23', '2026-08-07 06:28:32'),
(2, '1327bd6d-35d9-4242-b53f-f2b3f45c1e8d', 'RSV-20260807-000002', 1, 'Juan Dela Cruz', 'juan@gmail.com', '09123456789', 4, '2026-08-15', '09:00:00', '10:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'First time playing.', '2026-08-07 14:39:00', '2026-08-07 14:39:00'),
(3, '7cfdc55b-ce13-47c7-b54c-0f41b285691b', 'RSV-20260807-000003', 1, NULL, NULL, NULL, 4, '2026-08-15', '11:00:00', '12:00:00', '1.00', '250.00', '250.00', 'Pending', '', NULL, '2026-08-07 14:39:33', '2026-08-07 14:39:33'),
(4, 'e50bb102-e36f-4899-82b0-8ed3c3bb2546', 'RSV-20260807-000004', NULL, 'Reuel S. Mendoza', 'Reuelmendoza29@gmail.com', '09499401480', 4, '2026-08-15', '15:00:00', '16:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'TEST TEST', '2026-08-07 15:19:41', '2026-08-07 15:19:41'),
(5, 'cdfe9222-a7e6-44e6-b9f2-3c595aab6cde', 'RSV-20260807-000005', NULL, 'Natus vitae ullam si', 'cudyd@example.com', 'Esse pariatur Illo', 4, '2026-08-23', '19:00:00', '20:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Quidem eum adipisici', '2026-08-07 15:45:41', '2026-08-07 15:45:41'),
(6, 'd1c3dc22-d150-4fa6-934c-c0f4cb468952', 'RSV-20260807-000006', NULL, 'Sunt quas commodi c', 'koxugixog@example.com', 'Sed ipsa ipsa labo', 4, '2026-08-09', '08:00:00', '09:00:00', '1.00', '250.00', '250.00', 'Confirmed', '', 'Qui totam quis volup', '2026-08-07 15:49:57', '2026-08-07 15:50:22'),
(7, '1a989917-bf32-4f12-b244-1faf78e19f79', 'RSV-20260807-000007', NULL, 'Quia elit eius cupi', 'webog@example.com', 'Minim a architecto v', 4, '2026-08-09', '10:00:00', '11:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Amet velit placeat', '2026-08-07 15:50:44', '2026-08-07 15:50:44'),
(8, 'ad548d13-adc7-471a-9e42-6de125b30756', 'RSV-20260808-000008', NULL, 'Rerum Nam esse eaqu', 'mutanofida@example.com', 'Ut libero in fugiat ', 4, '2026-08-16', '19:00:00', '20:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Cillum et cupidatat ', '2026-08-07 16:13:49', '2026-08-07 16:13:49'),
(9, 'ca01fe99-0556-4680-bc13-aa28ab6122cd', 'RSV-20260808-000009', NULL, 'Sit tempora omnis v', 'dyqu@example.com', 'Quis et rerum volupt', 4, '2026-08-16', '17:00:00', '18:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Sit numquam ad null', '2026-08-07 16:16:47', '2026-08-07 16:16:47'),
(10, 'b6dd3f95-05e2-450d-9bce-2bd633e1f5a8', 'RSV-20260808-000010', NULL, 'Provident culpa est', 'jykivanedo@example.com', 'Officiis vel volupta', 4, '2026-08-30', '08:00:00', '09:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Perspiciatis dolori', '2026-08-07 16:20:39', '2026-08-07 16:20:39'),
(11, '5ca0bd1e-542c-45de-89d6-70f74d2c9b1b', 'RSV-20260808-000011', NULL, 'Quis Nam veniam mag', 'kikijoj@example.com', 'Et facere minima bla', 4, '2026-08-30', '10:00:00', '11:00:00', '1.00', '250.00', '250.00', 'Pending', '', 'Dolor culpa volupta', '2026-08-07 16:22:51', '2026-08-07 16:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_players`
--

CREATE TABLE `reservation_players` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reservation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `player_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Owner', 'System Owner', '2026-08-07 01:17:16', '2026-08-07 01:17:16'),
(2, 'Admin', 'System Administrator', '2026-08-07 01:17:16', '2026-08-07 01:17:16'),
(3, 'Manager', 'Club Manager', '2026-08-07 01:17:16', '2026-08-07 01:17:16'),
(4, 'Receptionist', 'Handles Reservations', '2026-08-07 01:17:16', '2026-08-07 01:17:16'),
(5, 'Coach', 'Coach', '2026-08-07 01:17:16', '2026-08-07 01:17:16'),
(6, 'Player', 'Regular Player', '2026-08-07 01:17:16', '2026-08-07 01:17:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `first_name`, `last_name`, `username`, `email`, `password_hash`, `phone`, `avatar`, `status`, `email_verified`, `last_login`, `created_at`, `updated_at`) VALUES
(1, '744251d3-5d5f-40f7-9875-3b750b6ffb4f', 'Mervin', 'Naguio', 'mervin', 'mervin@gmail.com', '$2b$10$rbpkGZ9SPv9p9T4Jk8bxNObCO.7WF4lKu9tH5e0t48oLAm8VUfzLq', '09123456789', NULL, 'ACTIVE', 0, '2026-08-07 13:04:16', '2026-08-07 01:29:58', '2026-08-07 05:04:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courts`
--
ALTER TABLE `courts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `court_number` (`court_number`);

--
-- Indexes for table `court_schedules`
--
ALTER TABLE `court_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `fk_court_schedule` (`court_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `payment_no` (`payment_no`),
  ADD KEY `fk_payment_reservation` (`reservation_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `reservation_no` (`reservation_no`),
  ADD KEY `court_id` (`court_id`),
  ADD KEY `reservations_ibfk_1` (`user_id`);

--
-- Indexes for table `reservation_players`
--
ALTER TABLE `reservation_players`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `fk_user_roles_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courts`
--
ALTER TABLE `courts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `court_schedules`
--
ALTER TABLE `court_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reservation_players`
--
ALTER TABLE `reservation_players`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `court_schedules`
--
ALTER TABLE `court_schedules`
  ADD CONSTRAINT `fk_court_schedule` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`);

--
-- Constraints for table `reservation_players`
--
ALTER TABLE `reservation_players`
  ADD CONSTRAINT `reservation_players_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservation_players_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
