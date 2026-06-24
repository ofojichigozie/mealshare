import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MealsService } from './meals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Controller('households/:householdId/meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() createMealDto: CreateMealDto,
  ) {
    return this.mealsService.create(householdId, user.id, createMealDto);
  }

  @Get()
  async findAll(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mealsService.findAll(householdId, user.id, startDate, endDate);
  }

  @Put(':mealId')
  async update(
    @Param('householdId') householdId: string,
    @Param('mealId') mealId: string,
    @CurrentUser() user: any,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(householdId, mealId, user.id, updateMealDto);
  }

  @Delete(':mealId')
  async remove(
    @Param('householdId') householdId: string,
    @Param('mealId') mealId: string,
    @CurrentUser() user: any,
  ) {
    return this.mealsService.remove(householdId, mealId, user.id);
  }
}
