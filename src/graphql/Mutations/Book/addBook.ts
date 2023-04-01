import prisma from "../../../utils/PrismaClient.js";
import builder from "../../../utils/schemaBuilder.js";
import { AuthorInput, BookInput, GenreInput } from "../../Types/input.js";

builder.mutationField("addBook", (t) =>
  t.prismaField({
    type: "Book",
    args: {
      book: t.arg({ type: BookInput, required: true }),
      authors: t.arg({ type: [AuthorInput], required: true }),
      genres: t.arg({ type: [GenreInput] }),
    },

    resolve: async (_, __, args) => {
      const { name: bookName, description: bookDescription } = args.book;
      const { genres, authors } = args;

      return await prisma.book.upsert({
        where: { name: bookName },
        update: { name: bookName },
        create: {
          name: bookName,
          description: bookDescription,
          authors: {
            create: authors.map((_author) => {
              return {
                author: {
                  connectOrCreate: {
                    where: {
                      name: _author.name,
                    },
                    create: {
                      name: _author.name,
                      email: _author.email,
                    },
                  },
                },
              };
            }),
          },
          genres: {
            create: genres?.map((_genre) => {
              return {
                genre: {
                  connectOrCreate: {
                    where: {
                      name: _genre.name,
                    },
                    create: {
                      name: _genre.name,
                    },
                  },
                },
              };
            }),
          },
        },
      });
    },
  })
);
