const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
} = require('graphql');
const app = express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt),
            description: 'The book ID'
        },
        name: {
            type:GraphQLNonNull(GraphQLString),
            description: 'The name of the book'
        },
        authorId: {
            type: GraphQLNonNull(GraphQLInt),
            description: 'The author ID of the book'
        },
        author: {
            type: AuthorType,
            description: 'The author of the book',
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of books',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt),
            description: 'The author ID'
        },
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The name of the author'
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'The books written by the author',
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single Book',
            args: {
                id: {
                    type: GraphQLInt,
                    description: 'The book ID'
                }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        author: {
            type: AuthorType,
            description: 'A single Author',
            args: {
                id: {
                    type: GraphQLInt,
                    description: 'The author ID'
                }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of Authors',
            resolve: () => authors
        }
    }),
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString),
                    description: 'The name of the book'
                },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The author ID of the book'
                }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a Author',
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString),
                    description: 'The name of the author'
                },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        },
        deleteBook:{
            type: BookType,
            description: 'Delete a book',
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The book ID'
                }
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id)
                books.splice(books.indexOf(book), 1)
                return book
            }
        },
        deleteAuthor:{
            type: AuthorType,
            description: 'Delete a author',
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The author ID'
                }
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id)
                authors.splice(authors.indexOf(author), 1)
                return author
            }
        },
        updateBook:{
            type: BookType,
            description: 'Update a book',
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The book ID'
                },
                name: {
                    type: GraphQLNonNull(GraphQLString),
                    description: 'The name of the book'
                },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The author ID of the book'
                }
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id)
                book.name = args.name
                book.authorId = args.authorId
                return book
            }
        },
        updateAuthor:{
            type: AuthorType,
            description: 'Update a author',
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt),
                    description: 'The author ID'
                },
                name: {
                    type: GraphQLNonNull(GraphQLString),
                    description: 'The name of the author'
                }
            },
            resolve: (parent, args) => {
                const author = authors.find(author => author.id === args.id)
                author.name = args.name
                return author
            }
        }
    }),
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true,

}));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
}
);