import { pgTable, uuid, varchar, decimal, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { households } from './households.schema';
import { users } from './users.schema';

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }), // 'groceries', 'utilities', 'dining', 'household', 'other'
  paidBy: uuid('paid_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relationships
export const expensesRelations = relations(expenses, ({ one }) => ({
  household: one(households, {
    fields: [expenses.householdId],
    references: [households.id],
  }),
  paidByUser: one(users, {
    fields: [expenses.paidBy],
    references: [users.id],
  }),
}));

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
