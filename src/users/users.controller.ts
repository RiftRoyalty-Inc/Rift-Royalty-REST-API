import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('signin')
    async findUserToAuth(
        @Headers('email') email: string,
        @Headers('password') password: string) {
        email = email.toLowerCase();
        const data = await (this.usersService.findUserToAuth(email, password));
        return data;
    }
    @Post('gamelinked')
    async isGameLinked(
        @Headers('userToken') userToken: string,
    ) {
        return this.usersService.isGameLinked(userToken);
    }

    @Post('signup')
    create(@Body() createUserDto: CreateUserDto) {
        createUserDto.username = createUserDto.username.toLowerCase();
        createUserDto.email = createUserDto.email.toLowerCase();
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
