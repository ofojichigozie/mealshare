import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { ExpensesService } from '../expenses/expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('households')
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
  constructor(
    private readonly householdsService: HouseholdsService,
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createHouseholdDto: CreateHouseholdDto) {
    return this.householdsService.create(user.id, createHouseholdDto);
  }

  @Get('my-household')
  async getMyHousehold(@CurrentUser() user: any) {
    return this.householdsService.getUserHousehold(user.id);
  }

  @Get(':householdId')
  async findOne(@Param('householdId') householdId: string, @CurrentUser() user: any) {
    return this.householdsService.findOne(householdId, user.id);
  }

  @Put(':householdId')
  async update(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
  ) {
    return this.householdsService.update(householdId, user.id, updateHouseholdDto);
  }

  @Post(':householdId/members')
  async addMember(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.householdsService.addMember(householdId, user.id, addMemberDto);
  }

  @Delete(':householdId/members/:userId')
  async removeMember(
    @Param('householdId') householdId: string,
    @Param('userId') userIdToRemove: string,
    @CurrentUser() user: any,
  ) {
    return this.householdsService.removeMember(householdId, user.id, userIdToRemove);
  }

  @Delete(':householdId/leave')
  async leaveHousehold(@Param('householdId') householdId: string, @CurrentUser() user: any) {
    return this.householdsService.leaveHousehold(householdId, user.id);
  }

  @Get(':householdId/balances')
  async getBalances(@Param('householdId') householdId: string, @CurrentUser() user: any) {
    return this.expensesService.getBalances(householdId, user.id);
  }
}
