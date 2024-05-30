import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
// import { EmailVerification } from 'src/email-verification/entities/email-verification.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly emailVerificationService: EmailVerificationService
    ) { }

    async create(createUserDto: CreateUserDto) {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(createUserDto.password, salt);
        createUserDto.password = hash;
        createUserDto.role = 'user';
        createUserDto.active = true;
        console.log(createUserDto);
        const user = this.usersRepository.create(createUserDto);
        const res = await this.usersRepository.save(user);
        if (res != null || res != undefined) {
            await this.emailVerificationService.sendVerificationEmail({ email: createUserDto.email });
            return `{"code": "1", "msg": "OK"}`;
        } else {
            return `{"code": "0", "msg": "USER_NOT_CREATED"}`;
        }
    }

    async findUserToAuth(username: string, password: string) {
        return await this.usersRepository.findOne({ where: { username: username, password: password } });
    }

    async findAll() {
        console.log('finding. . .');
        return await this.usersRepository.find();
    }

    async findByUsername(usernameAux: string) {
        console.log('here');
        return await this.usersRepository.findOne({ where: { username: usernameAux } });
    }

    async findOne(id: number) {
        return await this.usersRepository.findOne({ where: { id: id } });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException();
        }

        Object.assign(user, updateUserDto);
        return await this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException();
        }

        return await this.usersRepository.remove(user);
    }
}
