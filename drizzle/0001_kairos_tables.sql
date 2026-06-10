CREATE TABLE IF NOT EXISTS `KairosUser` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text,
	`name` text NOT NULL,
	`identity` text DEFAULT 'DESCENDER' NOT NULL,
	`tokenLevel` text DEFAULT 'WANDERER' NOT NULL,
	`tokenScore` integer DEFAULT 0 NOT NULL,
	`verifiedAt` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `KairosUser_phone_unique` ON `KairosUser` (`phone`);

CREATE TABLE IF NOT EXISTS `Market` (
	`id` text PRIMARY KEY NOT NULL,
	`creatorId` text NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`date` text NOT NULL,
	`boothCount` integer NOT NULL,
	`description` text,
	`layout` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`creatorId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `Vendor` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`category` text NOT NULL,
	`style` text,
	`priceRange` text,
	`city` text,
	`description` text,
	`logo` text,
	`creditScore` integer DEFAULT 60 NOT NULL,
	`expoCount` integer DEFAULT 0 NOT NULL,
	`goodRate` real DEFAULT 0.8 NOT NULL,
	`violations` integer DEFAULT 0 NOT NULL,
	`complaints` integer DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS `Vendor_userId_unique` ON `Vendor` (`userId`);

CREATE TABLE IF NOT EXISTS `Booth` (
	`id` text PRIMARY KEY NOT NULL,
	`marketId` text NOT NULL,
	`vendorId` text,
	`number` text NOT NULL,
	`positionX` real NOT NULL,
	`positionY` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	`hasPower` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	FOREIGN KEY (`marketId`) REFERENCES `Market`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `PlazaPost` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`relatedMarketId` text,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `Conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text,
	`messages` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `Service` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`credentialUrl` text,
	`projectCount` integer DEFAULT 0 NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS `Service_userId_unique` ON `Service` (`userId`);