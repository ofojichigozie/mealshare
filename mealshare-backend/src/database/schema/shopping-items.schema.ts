import { pgTable, uuid, varchar, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { households } from './households.schema';
import { users } from './users.schema';

export const shoppingItems = pgTable('shopping_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: varchar('quantity', { length: 100 }),
  category: varchar('category', { length: 50 }), // 'produce', 'dairy', 'meat', 'pantry', 'beverages', 'other'
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  isPurchased: boolean('is_purchased').default(false).notNull(),
  addedBy: uuid('added_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relationships
export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
  household: one(households, {
    fields: [shoppingItems.householdId],
    references: [households.id],
  }),
  addedByUser: one(users, {
    fields: [shoppingItems.addedBy],
    references: [users.id],
  }),
}));

export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type NewShoppingItem = typeof shoppingItems.$inferInsert;
