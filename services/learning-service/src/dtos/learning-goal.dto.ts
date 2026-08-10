import { IsString, IsNumber, IsArray, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateLearningGoalDto {
  @IsString()
  skillName!: string;

  @IsString()
  currentLevel!: string;

  @IsString()
  targetLevel!: string;

  @IsNumber()
  dailyMinutes!: number;

  @IsArray()
  @IsString({ each: true })
  learningDays!: string[];

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  learningReason?: string;

  @IsOptional()
  @IsString()
  learningStyle?: string;
}

export class UpdateLearningGoalDto {
  @IsOptional()
  @IsString()
  skillName?: string;

  @IsOptional()
  @IsString()
  currentLevel?: string;

  @IsOptional()
  @IsString()
  targetLevel?: string;

  @IsOptional()
  @IsNumber()
  dailyMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningDays?: string[];

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  learningReason?: string;

  @IsOptional()
  @IsString()
  learningStyle?: string;

  @IsOptional()
  @IsEnum(['active', 'completed', 'abandoned'])
  status?: string;
}
