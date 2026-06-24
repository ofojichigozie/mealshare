export interface Household {
  id: string;
  name: string;
  createdBy: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
  members?: HouseholdMember[];
}

export interface HouseholdMember {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
}

export interface CreateHouseholdDto {
  name: string;
}

export interface UpdateHouseholdDto {
  name: string;
}

export interface AddMemberDto {
  usernameOrEmail: string;
}
