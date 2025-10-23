import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['brand'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, brandId: user.brandId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        brand: user.brand,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingBrand = await this.brandRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingBrand) {
      throw new BadRequestException('Email already exists. Please use a different email or try logging in.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const brand = this.brandRepository.create({
      companyName: registerDto.companyName,
      email: registerDto.email,
      password: hashedPassword,
      subdomain: this.generateSubdomain(registerDto.companyName),
      appName: registerDto.appName,
      logoUrl: registerDto.logoUrl,
      primaryColor: registerDto.primaryColor,
      secondaryColor: registerDto.secondaryColor,
      typography: registerDto.typography,
    });

    const savedBrand = await this.brandRepository.save(brand);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      brandId: savedBrand.id,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = { email: savedUser.email, sub: savedUser.id, brandId: savedUser.brandId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        brand: savedBrand,
      },
    };
  }

  private generateSubdomain(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + Math.random().toString(36).substring(2, 8);
  }
}
