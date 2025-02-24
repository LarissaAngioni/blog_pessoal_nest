import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemaService } from "./services/tema.service";
import { TemaController } from "./controllers/tema.controller";
import { Tema } from "./entities/tema.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Tema])],
    providers: [TemaService],
    controllers: [TemaController],
    exports: [TypeOrmModule]
})
export class TemaModule {}
