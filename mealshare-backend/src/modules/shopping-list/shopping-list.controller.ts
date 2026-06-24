import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('households/:householdId/shopping-list')
@UseGuards(JwtAuthGuard)
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() createItemDto: CreateItemDto,
  ) {
    return this.shoppingListService.create(householdId, user.id, createItemDto);
  }

  @Get()
  async findAll(@Param('householdId') householdId: string, @CurrentUser() user: any) {
    return this.shoppingListService.findAll(householdId, user.id);
  }

  @Put(':itemId')
  async update(
    @Param('householdId') householdId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.shoppingListService.update(householdId, itemId, user.id, updateItemDto);
  }

  @Delete(':itemId')
  async remove(
    @Param('householdId') householdId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
  ) {
    return this.shoppingListService.remove(householdId, itemId, user.id);
  }
}
