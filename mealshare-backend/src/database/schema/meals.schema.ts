import { pgTable, uuid, varchar, date, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { households } from './households.schema';
import { users } from './users.schema';

export const meals = pgTable(
  'meals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    date: date('date').notNull(),
    mealType: varchar('meal_type', { length: 20 }).notNull(), // 'breakfast', 'lunch', 'dinner'
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: only one meal per date and mealType per household
    uniqueDateMealType: unique().on(table.householdId, table.date, table.mealType),
  }),
);

// Define relationships
export const mealsRelations = relations(meals, ({ one }) => ({
  household: one(households, {
    fields: [meals.householdId],
    references: [households.id],
  }),
  assignedToUser: one(users, {
    fields: [meals.assignedTo],
    references: [users.id],
    relationName: 'assignedMeals',
  }),
  createdByUser: one(users, {
    fields: [meals.createdBy],
    references: [users.id],
    relationName: 'createdMeals',
  }),
}));

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
