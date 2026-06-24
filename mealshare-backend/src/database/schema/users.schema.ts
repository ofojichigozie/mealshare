import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { meals } from './meals.schema';
import { shoppingItems } from './shopping-items.schema';
import { households } from './households.schema';
import { householdMembers } from './household-members.schema';
import { notifications } from './notifications.schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  assignedMeals: many(meals, { relationName: 'assignedMeals' }),
  createdMeals: many(meals, { relationName: 'createdMeals' }),
  addedItems: many(shoppingItems, { relationName: 'addedItems' }),
  purchasedItems: many(shoppingItems, { relationName: 'purchasedItems' }),
  createdHouseholds: many(households, { relationName: 'createdHouseholds' }),
  householdMemberships: many(householdMembers, { relationName: 'householdMemberships' }),
  notifications: many(notifications),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
