import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentIdDto } from './dtos/comment-id.dto';
import { CommentCreateDto } from './dtos/comment-create.dto';
import { CommentEditDto } from './dtos/comment-edit.dto';
import { UsersService } from 'src/users/users.service';
import { CommentsEntity } from './comments.entity';
import { NewsService } from '../news.service';

@Controller('news-comments')
export class CommentsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsService: CommentsService,
    private usersService: UsersService,
  ) {}

  @Post('create')
  async create(
    @Query('idNews') idNews: string,
    @Body() comment: CommentCreateDto,
  ) {
    try {
      console.log('comment:', comment);

      const _user = await this.usersService.findById(comment.authorId);
      if (!_user) {
        throw new HttpException(
          'Не существует такого автора',
          HttpStatus.BAD_REQUEST,
        );
      }

      const _news = await this.newsService.findById(+idNews);
      if (!_news) {
        throw new HttpException(
          'Не существует такой категории',
          HttpStatus.BAD_REQUEST,
        );
      }
      const _commentsEntity = new CommentsEntity();

      _commentsEntity.message = comment.message;
      _commentsEntity.user = _user;
      _commentsEntity.news = _news;

      const _comment = await this.commentsService.create(_commentsEntity);
      return _comment;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('edit')
  async edit(
    @Query('idComment') idComment: string,
    @Body() comment: CommentEditDto,
  ) {
    const _commentPrevios = await this.commentsService.findById(+idComment);

    if (!_commentPrevios) {
      throw new HttpException(
        'Не существует такого комментария',
        HttpStatus.BAD_REQUEST,
      );
    }
    const _commentsEntity = new CommentsEntity();

    _commentsEntity.message = comment.message;

    const _commentNew = await this.commentsService.edit(
      _commentsEntity,
      +idComment,
    );

    return _commentNew;
  }

  @Delete(':id')
  async remove(@Param() params: CommentIdDto): Promise<boolean> {
    return this.commentsService.remove(+params.id);
  }
}
