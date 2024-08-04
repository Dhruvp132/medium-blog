import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'


export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables : {
        userId : string;
    }
}>();

blogRouter.use("/*", async (c, next) => {
    //extract the user id 
    //pass it down to the route handleer 
    const header = c.req.header("authorization") || "";
    try {
        const user = await verify(header, c.env.JWT_SECRET);
        if(user) {
            c.set("userId", user.id as string);
            await next(); 
        } else {
            return c.json("you are not logged in")
        }
    } catch (e) {
        return c.json("invalid token")
    }
}) 

blogRouter.post("/", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    const body = await c.req.json();
    console.log(body)
    const authorId = c.get("userId");
    if (!body.title || !body.content) {
      return c.json({ message: "Title and content are required" }, 400);
    }
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });
  
    return c.json({ id: blog.id });
  });
  
blogRouter.put('/', async (c) => {
    const body = await c.req.json(); 
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where : {
            id : body.id
        },
        data :{
            title : body.title, 
            content : body.content,
        }
    })
    return c.json({
        id : blog.id
    })
})

//Todo: add pagination
//pagination -> you shouldn't return all the blogs 
// return n blogs and user wil ask for more as they scroll down on the window
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blogs = await prisma.blog.findMany({
            select : {
                content : true, 
                title : true, 
                id : true, 
                author : {
                    select : {
                        name : true,
                    }
                }, 
            }
        })
        return c.json({ 
            blogs
        })
    } catch(e) {
        c.status(411)
        return c.json({
            message : "Error while fetching the data"
        })
    }
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where : {
                id : Number(id),
            },
            select : {
                id : true, 
                title : true,
                content : true,
                author : {
                    select : {
                        name : true,
                    }
                },
            }
        })
        return c.json({
            blog
        })
    } catch(e) {
        c.status(411)
        return c.json({
            message : "Error while fetching the data"
        })
    }
})