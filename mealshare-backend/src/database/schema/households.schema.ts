import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { householdMembers } from './household-members.schema';
import { meals } from './meals.schema';
import { shoppingItems } from './shopping-items.schema';
import { notifications } from './notifications.schema';

export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relationships
export const householdsRelations = relations(households, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [households.createdBy],
    references: [users.id],
    relationName: 'createdHouseholds',
  }),
  members: many(householdMembers),
  meals: many(meals),
  shoppingItems: many(shoppingItems),
  notifications: many(notifications),
}));

export type Household = typeof households.$inferSelect;
export type NewHousehold = typeof households.$inferInsert;
