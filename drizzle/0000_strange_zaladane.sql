CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` text,
	`password` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Booth` (
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
--> statement-breakpoint
CREATE TABLE `Conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text,
	`messages` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Market` (
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
--> statement-breakpoint
CREATE TABLE `PlazaPost` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`relatedMarketId` text,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `KairosUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Service` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `Service_userId_unique` ON `Service` (`userId`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `KairosUser` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `KairosUser_phone_unique` ON `KairosUser` (`phone`);--> statement-breakpoint
CREATE TABLE `Vendor` (
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
--> statement-breakpoint
CREATE UNIQUE INDEX `Vendor_userId_unique` ON `Vendor` (`userId`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text NOT NULL,
	`createdAt` text,
	`updatedAt` text
);
