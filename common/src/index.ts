import z from "zod";

export const signupInput = z.object({
    name : z.string().optional(),
    email : z.string().email(), 
    password : z.string().min(6)
})


//type inferenece in zod 

export const signinInput = z.object({
    email : z.string().email(), 
    password : z.string().min(6)
})


//type inferenece in zod 


export const createBlogInput = z.object({
    title : z.string(), 
    content : z.string(),
})

//type inferenece in zod 

export const updateBlogInput = z.object({
    title : z.string(), 
    content : z.string(),
    id : z.number(),
})

//type inferenece in zod 
export type updateBlogInput = z.infer<typeof updateBlogInput> 
export type SigninInput = z.infer<typeof signinInput> 
export type SignupInput = z.infer<typeof signupInput> 
export type createBlogInput = z.infer<typeof createBlogInput> 
