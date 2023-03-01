import {
  Body,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Render,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HelperFileLoaderUser } from 'src/utils/helperFileLoaderUser';
import { imageFileFilter } from 'src/utils/imageFileFilter';
import { UserCreateDto } from '../dto/user-create.dto';
import { UsersEntity } from '../users.entity';
import { UsersService } from '../users.service';
import { hash } from '../../utils/crypto';

const USER_PATH = '/user-static/';
const usersHelperFileLoader = new HelperFileLoaderUser();

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('profile')
  async getViewAll(@Request() req): Promise<{ cookies: any }> {
    const cookies = req.cookies?.user ? await req.cookies : null;
    console.log('cookies:', cookies);
    return { cookies };
  }

  @Post('edit')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: usersHelperFileLoader.destinationPath,
        filename: usersHelperFileLoader.customFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async edit(
    @Query('idUser') idUser: string,
    @Body() user: UserCreateDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    try {
      const _user = await this.usersService.findById(+idUser);
      if (!_user) {
        throw new HttpException(
          'Не существует такого пользователя',
          HttpStatus.BAD_REQUEST,
        );
      }

      const _userEntity = new UsersEntity();

      if (avatar?.filename) {
        _userEntity.avatar = USER_PATH + avatar.filename;
      }
      _userEntity.firstName = user.firstName;
      _userEntity.lastName = user.lastName;
      _userEntity.email = user.email;
      _userEntity.password = await hash(user.password);

      const result = await this.usersService.edit(_userEntity, +idUser);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
