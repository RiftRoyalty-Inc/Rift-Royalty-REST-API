import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
// import { EmailVerification } from 'src/email-verification/entities/email-verification.entity';
import * as bcrypt from 'bcrypt';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { SummonerService } from 'src/summoner/summoner.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly authService: AuthenticationService,
        @Inject(forwardRef(() => SummonerService))
        private readonly summonerService: SummonerService
    ) { }

    async create(createUserDto: CreateUserDto) {
        const { username, email, password } = createUserDto;
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        createUserDto.password = hash;
        createUserDto.role = 'user';
        createUserDto.active = true;
        const userExists = await this.usersRepository.findOne({ where: [{ username }, { email }] });
        if (userExists) {
            if (!userExists.isVerified) {
                userExists.username = username;
                userExists.email = email;
                userExists.password = hash;
                userExists.role = 'user';
                const updatedUser = await this.usersRepository.save(userExists);
                if (updatedUser) {
                    await this.emailVerificationService.sendVerificationEmail({ email });
                    return `{"code": "1", "msg": "OK"}`;
                } else {
                    return `{"code": "100", "msg": "Unknown Error!"}`;
                }
            } else {
                if (userExists.email == email) {
                    return `{"code": "300", "msg": "Email already exists!"}`;
                }
                if (userExists.username == username) {
                    return `{"code": "301", "msg": "Username already exists!"}`;
                }
            }
        } else {
            const user = this.usersRepository.create(createUserDto);
            const res = await this.usersRepository.save(user);
            if (res != null || res != undefined) {
                await this.emailVerificationService.sendVerificationEmail({ email: createUserDto.email });
                return `{"code": "1", "msg": "OK"}`;
            } else {
                return `{"code": "101", "msg": "Unknown Error!"}`;
            }
        }
    }

    async isGameLinked(userToken: string) {
        const userData = await this.authService.compareJwtToken(userToken);
        const userId = userData.userId;
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        let msg;
        let code;
        if (!user) {
            msg = 'User not found';
            code = '0';
        } else {
            if (user.puuid == null || user.puuid == undefined || user.puuid == '') {
                msg = 'Not linked';
                code = '300';
            } else {
                console.log(user.puuid);
                const summonerInfo = await this.summonerService.getAccountByPuuid(user.region, user.puuid);
                console.log(summonerInfo);
                const region = user.region;
                const tagLine = summonerInfo.tagLine;
                const gameName = summonerInfo.gameName;
                const iconInfo = JSON.parse(await this.summonerService.getSummonerIcon(gameName, tagLine, region));
                const iconId = iconInfo.profileIconId;
                msg = 'OK';
                code = '1';
                return `{"code":"${code}","msg":"${msg}","tagLine":"${tagLine}","gameName":"${gameName}","region":"${region}","iconId":"${iconId}"}`;
            }
        }
        return `{"code":"${code}","msg":"${msg}"}`
    }
    async findUserToAuth(email: string, password: string) {
        const userExists = await this.usersRepository.findOne({ where: { email } });
        let code: string;
        let msg: string;
        let token: string;
        if (userExists) {
            const passwordsMatch = await bcrypt.compare(password, userExists.password);
            if (passwordsMatch) {
                if (userExists.isVerified) {
                    code = "1";
                    msg = "OK";
                    token = await this.authService.generateJwtToken(userExists);
                } else {
                    code = "2";
                    msg = "User not verified";
                }
            } else {
                code = "0";
                msg = "Wrong Email or Password";
            }
        } else {
            code = "0";
            msg = "Wrong Email or Password";
        }
        if (token == null || token == undefined) {
            return `{"code": "${code}", "msg": "${msg}"}`
        } else {
            console.log(token);
            return `{"code": "${code}", "msg": "${msg}", "token": "${token}"}`
        }
    }

    async findAll() {
        return await this.usersRepository.find();
    }

    async findByUsername(usernameAux: string) {
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
