import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Postagem, Tema, Usuario e Auth (e2e)', () => {

  let token: any;
  let usuarioId: any, temaId: any, postagemId: any;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [__dirname + "./../src/**/entities/*.entity.ts"],
          synchronize: true,
          dropSchema: true
        }),
        AppModule],
    }).compile();



    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("01 - Deve Cadastrar um novo Usuário", async () => {
    const resposta = await request(app.getHttpServer())
    .post("/usuarios/cadastrar")
    .send({
      nome: "Root",
      usuario: "root@root.com",
      senha: "rootroot",
      foto: "-",
    })
    .expect(201);

    usuarioId = resposta.body.id;

  });

  it("02 - Não Deve Cadastrar um Usuário Duplicado", async () => {
    const resposta = await request(app.getHttpServer())
    .post("/usuarios/cadastrar")
    .send({
      nome: "Root",
      usuario: "root@root.com",
      senha: "rootroot",
      foto: "-",
    })
    .expect(400);

  })

  it("03 - Deve Autenticar um Usuário (Login)", async () => {
    const resposta = await request(app.getHttpServer())
    .post("/usuarios/logar")
    .send({
      usuario: "root@root.com",
      senha: "rootroot",
    })
    .expect(200);

    token = resposta.body.token;

  })

  it("04 - Deve Listar todos os Usuários", async () => {
    const resposta = await request(app.getHttpServer())
    .get("/usuarios/all")
    .set("Authorization",  `${token}`)
    .expect(200);
  })
  
  it("05 - Deve Atualizar os dados de um Usuário", async () => {
    const resposta = await request(app.getHttpServer())
    .put("/usuarios/atualizar")
    .set("Authorization",  `${token}`)
    .send({
      id: usuarioId,
      nome: "Admin Sys",
      usuario: "root@root.com",
      senha: "rootroot",
      foto: "root.png",
    })
    .expect(200)
    .then(resposta => {
      expect("Admin Sys").toEqual(resposta.body.nome);
    });

  })

  it("06 - Deve Listar Usuário por id", async () => {
    const resposta = await request(app.getHttpServer())
    .get(`/usuarios/${usuarioId}`)
    .set("Authorization",  `${token}`)
    .expect(200);
  
  })

  it("07 - Deve Listar Usuário por Usuario", async () => {
    const resposta = await request(app.getHttpServer())
    .get(`/usuarios/user/root@root.com`)
    .set("Authorization",  `${token}`)
    .expect(200);
  })

  it("08 - Deve Cadastrar um novo Tema", async () => {
    const resposta = await request(app.getHttpServer())
    .post("/temas")
    .set("Authorization",  `${token}`)
    .send({
      descricao: "Ciências"
    })
    .expect(201);

    temaId = resposta.body.id;
  })

  it("09 - Deve Listar todos os Temas", async () => {
    const resposta = await request(app.getHttpServer())
    .get("/temas")
    .set("Authorization",  `${token}`)
    .expect(200);
  })

  it("10 - Deve Listar Tema por id", async () => {
    const resposta = await request(app.getHttpServer())
    .get(`/temas/${temaId}`)
    .set("Authorization", `${token}`)
    .expect(200);
  })

  it("11 - Deve Listar Tema por Descrição", async () => {
    const resposta = await request(app.getHttpServer())
    .get("/temas/descricao/ci")
    .set("Authorization", `${token}`)
    .expect(200);
  })

  it("12 - Deve Atualizar um Tema", async () => {
    const resposta = await request(app.getHttpServer())
    .put(`/temas`)
    .set("Authorization",  `${token}`)
    .send({
      id: temaId,
      descricao: "Ciência Social"
    })
    .expect(200)
    .then(resposta => {
      expect("Ciência Social").toEqual(resposta.body.descricao)
    });
  })

  // it("13 - Deve Apagar Tema por id", async () => {
  //   const resposta = await request(app.getHttpServer())
  //   .delete(`/temas/${temaId}`)
  //   .set("Authorization",  `${token}`)
  //   .expect(204);
  // })

  it("14 - Deve Cadastrar uma nova Postagem", async () => {
    const resposta = await request(app.getHttpServer())
    .post("/postagens")
    .set("Authorization",  `${token}`)
    .send({
      titulo: "Descobertas Marinhas",
      texto: "Novas descobertas",
      tema: {
        id: temaId
      },
      usuario: {
        id: usuarioId
      }
    })
    .expect(201);

    postagemId = resposta.body.id;
  })

  it("15 - Deve Listar todas as Postagens", async () => {
    const resposta = await request(app.getHttpServer())
    .get("/postagens")
    .set("Authorization",  `${token}`)
    .expect(200);
  })

  it("16 - Deve Listar Postagem por id", async () => {
    const resposta = await request(app.getHttpServer())
    .get(`/postagens/${postagemId}`)
    .set("Authorization",  `${token}`)
    .expect(200);
  })

  it("17 - Deve Listar Postagem por Titulo", async () => {
    const resposta = await request(app.getHttpServer())
    .get(`/postagens/titulo/mar`)
    .set("Authorization", `${token}`)
    .expect(200);
  })

  it("18 - Deve Atualizar uma Postagem", async () => {
    const resposta = await request(app.getHttpServer())
    .put(`/postagens`)
    .set("Authorization",  `${token}`)
    .send({
      id: postagemId,
      titulo: "Descobertas Marinhas no Brasil",
      texto: "Novas descobertas",
      tema: {
        id: temaId
      },
      usuario: {
        id: usuarioId
      }
    })
    .expect(200)
    .then(resposta => {
      expect("Descobertas Marinhas no Brasil").toEqual(resposta.body.titulo)
    });
    })
    
    
});
