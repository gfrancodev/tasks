import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtManagerService {
  public secretKey = process.env.SECRET_KEY;
  public privateKey = process.env.PRIVATE_KEY;
  public publicKey = process.env.PUBLIC_KEY;
  public passphase = process.env.PASSPHASE;

  constructor(private jwtService: JwtService) {}

  encode(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.secretKey,
      privateKey: {
        key: this.privateKey,
        passphrase: this.passphase,
      },
      algorithm: 'HS256',
      mutatePayload: false,
      expiresIn: '1h',
      encoding: 'utf-8',
    });
  }

  verify<T>(token: any) {
    return this.jwtService.verify(token, {
      secret: this.secretKey,
      publicKey: this.publicKey,
      algorithms: ['HS256'],
    }) as T;
  }
}
