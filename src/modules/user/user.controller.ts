import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe, Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserEntity } from './entity/user.entity';
import { UUIDType } from '../common/validator/FindOneUUID.validator';
import { UpdatePayload } from './payloads/update.payload';
import { Public } from '../common/decorator/public.decorator';
import { Roles } from '../common/decorator/roles.decorator';
import { AppRoles } from '../common/enum/roles.enum';
import { RegisterPayload } from '../auth/payloads/register.payload';

@Controller('api/v1/user')
@ApiTags('User')
export class UserController {
  /**
   * User controller constructor
   * @param userService user service
   */
  constructor(private readonly userService: UsersService) {}

  /**
   * Public endpoints (Marked by @Public() ) all users with pagination options
   * @param page page number
   * @param limit items limit
   */
  @Public()
  @Get()
  @ApiQuery({ name: 'page', required: true, example: '0' })
  @ApiQuery({ name: 'limit', required: true, example: '0' })
  @ApiResponse({ status: 200, description: 'Successful Request' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<Pagination<UserEntity>> {
    limit = limit > 100 ? 100 : limit;
    return await this.userService.getAll({
      page,
      limit,
    });
  }

  /**
   * Get user by id
   * @param id id in UUID
   */
  @ApiBearerAuth()
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successful ' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param() id: UUIDType): Promise<any> {
    return await this.userService.get(id);
  }

  /**
   * Update user by Id
   * @param id id in UUID
   * @param updatePayload update payload with optional parameters
   */
  @ApiBearerAuth()
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successful ' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param() id: UUIDType,
    @Body() updatePayload: UpdatePayload,
  ): Promise<any> {
    return await this.userService.update(id, updatePayload);
  }

  /**
   * Register user
   * @param payload register payload
   */
  @Public()
  @Post('register')
  @ApiResponse({ status: 201, description: 'Successful Registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Body() payload: RegisterPayload): Promise<any> {
    return await this.userService.create(payload);
  }

  /**
   * Delete user by Id
   * @param id id in UUID
   */
  @ApiBearerAuth()
  @Roles(AppRoles.ADMINS)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete Profile Request Received' })
  @ApiResponse({ status: 400, description: 'Delete Profile Request Failed' })
  async delete(@Param() id: UUIDType): Promise<any> {
    return await this.userService.delete(id);
  }
}
