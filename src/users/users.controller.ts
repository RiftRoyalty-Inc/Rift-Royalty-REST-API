import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('signin')
    async findUserToAuth(
        @Query('username') username: string,
        @Query('password') password: string) {
        console.log('huh');
        console.log(username, password);
        const data = await (this.usersService.findUserToAuth(username, password));
        console.log(data);
        if (data != null || data != undefined ) {
            return '{"code": "1", "msg": "OK"}';
        }else{
            return '{"code": "0", "msg": "USER_NOT_FOUND"}';
        }
    }



    @Post('signup')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
