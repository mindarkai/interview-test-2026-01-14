## Tech Stack
- ReactJS
- NextJS - pages directory and static site generation
- Tailwinds v4
- lucide-react - icons
- Supabase

## Layout
It is preferred to use stacking layouts using flex-box columns to avoid running out of horizontal
room. Avoid long names in buttons and prefer to use icons for buttons.

If buttons display text DO NOT give the button a static width.

## Static site generation
The frontend of the app uses static site generation so no server side rendering should be used. All
pages are stored in the pages directory and the NextJS app router is NOT used.

## Exports
Always use named exports unless explicitly told otherwise or required such as when creating NextJS
pages.

## Multi-tenet Database
The database is a multi-tenet database where the `account` table represents each tenet. All entities
that belong to or fall under an account should have an `account_id` property directly linking the
entity to an account. Entities that can belong to multiple accounts should use a join table to
link to an account. 

The `user` table is linked to the `account` table through the `account_membership` table.


## Required Entities
The following entities must be represented in the database schema. Additional properties or values
can be added to the entities

### User
Represents a signed-in user

Table name: user
Required Properties:
- id: uuid
- created_at: timestamptz
- name: text
- email: text
- profile_image_path?: text - path of profile picture in the accounts bucket
- hero_image_path?: text

### Account
Represents a company or organization

Table name: account
Required Properties:
- id: uuid
- created_at: timestamptz
- name: text
- logo_image_path?: text - path of profile picture in the accounts bucket
- hero_image_path?: text

### AccountMembership
Links a User to an Account

Table name: account_membership
Required Properties:
- id: uuid
- created_at: timestamptz
- last_accessed_at: timestamptz
- user_id: uuid
- account_id: uuid
- role: UserRole

### UserRole
An enumeration of different role types.
- admin: The admin of an account
- guest: A guest in an account
Enum name: user_role



## Schema Utility Types
The `@/lib/schema` import contains types and objects that map to the database schema.

`@/lib/schema` exports the following:
- typeDefs: An object of type `Record<string,TypeDef>` containing key value pairs for each table in the database.
- {type_name}: An interface that represents the structure of a value in a table.
- {type_name}_insert: An interface that represents the structure of a value to be inserted in the a table.
- {type_name}Schema: A Zod schema that represents the structure of a value in a table.
- {type_name}_insertSchema: A Zod schema that represents the structure of a value to be inserted in the a table.
- TypeDef: An interface that represents a type
- PropDef: An interface the represents a property of a type
- TypeMapping: An interface that maps type names to various programming languages.


Example:
``` ts
import { User, User_insert, UserSchema, User_insertSchema, typeDefs } from "@/lib/schema"

let user:User;
UserSchema.parse(user);

let newUser:User_insert;
User_insertSchema.parse(newUser);

const userPrimaryKey=typeDefs.primaryKey;
```

Schema Utility Interfaces:
``` ts
export interface TypeMapping
{
    name:string;
    ts?:string;
    zod?:string;
    convo?:string;
    sql?:string;
}

export interface PropDef
{
    name:string;
    type:TypeMapping;
    primary?:boolean;
    description?:string;
    sqlDef?:string;
    optional?:boolean;
    hasDefault?:boolean;
    isArray?:boolean;
    arrayDimensions?:number;
}

export interface TypeDef<
    TValue extends Record<string,any>=Record<string,any>,
    TInsert extends Record<string,any>=Record<string,any>
>{


    name:string;
    description?:string;
    type:'type'|'enum';
    primaryKey:(keyof TValue) & (keyof TInsert);
    sqlTable?:string;
    sqlSchema?:string;
    zodSchema?:ZodType;
    zodInsertSchema?:ZodType;
    props:PropDef[];
}
```

## Supabase client
The `supClient` function imported from "@/lib/supabase" can be used to access an instance of a
Supabase client.

Supabase Client Example:
``` ts
import { supClient } from "@/lib/supabase";

async function signInExampleAsync(){
    const signInResult=await supClient().auth.signInWithPassword({email,password});
}
```

## File Storage
File should be stored using supabase storage using the `accounts` bucket and use the following pattern for paths.

File path pattern: `{account_id}/users/{user_id}/{REST_OF_PATH}`

Example file path for:
- account_id: 809f36d5-8549-417e-b89c-7f1cb129b4dc
- user_id: fe691ceb-ba31-421e-9a51-7fb1207965e8
- file_name: example-book.pdf

Upload Path: `809f36d5-8549-417e-b89c-7f1cb129b4dc/users/fe691ceb-ba31-421e-9a51-7fb1207965e8/example-book.pdf`

### Storing file path in Database
When storing file paths in the database only path of uploaded files should be store, the full URL
will be generated client side using either the `fileStore()` service imported from `@/lib/fileStore`
or using the `useFileUrl` hook imported from `@/lib/hooks`. The `Img` component can be used to 
render images that use paths stored in the database.

Example of getting full URL for user profile picture using the `fileStore()` service:
``` ts
import { fileStore } from "@/lib/fileStore";
import { User } from "@/lib/schema";

async function exampleFunction(user:User){
    if(!user.profile_image_path){
        return;
    }
    const profilePictureUrl=await fileStore().getUrlAsync(user.profile_image_path);
}
```

Example of rending an image of a user profile picture using the `Img` component:
``` tsx
import { Img } from "@/components/Img";
import { User } from "@/lib/schema";

function ExampleComponent({user}:{user:User}){
    return (
        <div>
            <Img src={user.profile_image_path} alt={user.name}>
        </div>
    )
}
```

fileStore API:
``` ts
/**
 * Utility class for Supabase storage operations. By default the FileStore class uses the `accounts`
 * bucket.
 */
export class FileStore
{
    /**
     * Gets the full URL for a given path. When needed signed URLs will be created. The result of the
     * function will be cached and future calls for the same path will returned immediately
     */
    public async getUrlAsync(path:string):Promise<string|undefined>;

    /**
     * Attempts to get the cached URL for the path. If a URL has not been cached for the path
     * undefined will be returned.
     */
    public getCachedUrl(path:string):string|undefined;
}
```

useFileUrl API
``` ts
/**
 * Gets the full URL to a given path
 * Return values:
 * null: URL info is being loaded
 * undefined: URL not available
 * {string}: The full URL of the path
 * @param path The path to get a URL for. If null or undefined then undefined is returned.
 */
export const useFileUrl=(path:string|null|undefined):string|null|undefined=>;
```



## CRUD
Common CRUD operations can be handled using the `store()` service imported from `@/lib/store`
or the `useStore*()` React hooks imported from `@/lib/hooks`.

Store service example:
``` ts
import { store } from "@/lib/store";
import { typeDefs } from "@/lib/schema";

const user=await store().selectFirstMatchesAsync(typeDefs.User,{email:'example@example.com'})
```

Use store hook example:
``` ts
import { useFirstMatchingStoreItem } from "@/lib/hooks";
import { typeDefs } from "@/lib/schema";

function ExampleComponent()
{
    const user=useFirstMatchingStoreItem(typeDefs.User,{email:'example@example.com'});
}
```

### Store service API

``` ts

export class Store
{

    /**
     * Gets an item from a table by table name and id. Undefined is returned if no item exists
     * in the table with the given id.
     * @param table Name of table to get item from
     * @param id Id of item to get
     */
    public async selectFirstAsync<T extends Record<string,any>>(table:string|TypeDef<T>,id:string):Promise<T|undefined>;

    /**
     * Selects all matching items from the given table
     * @param table Name of table to select from
     * @param match An object with properties to match against
     * @param options Options used to control selection
     */
    public async selectMatchesAsync<T extends Record<string,any>>(table:string|TypeDef<T>,match:Partial<T>,options?:SelectOptions):Promise<Record<string,any>[]>;

    /**
     * Selects the first matching item form the given table
     * @param table Table to select from
     * @param match An object with properties to match against
     */
    public async selectFirstMatchesAsync<T extends Record<string,any>>(table:string|TypeDef<T>,match:Partial<T>):Promise<Record<string,any>|undefined>;

    /**
     * Updates an item value in a table by id.
     * @param table Name of table to set the item in.
     * @param id Id of the item to set
     * @param value Value of the item to set
     * @returns The value passed to the setItem function
     */
    public async insertAsync<T extends Record<string,any>>(table:string|TypeDef<Record<string,any>,T>,value:T):Promise<T>;
    
    /**
     * Updates an item value in a table by id.
     * @param table Name of table to set the item in.
     * @param id Id of the item to set
     * @param value Value of the item to set
     * @returns The value passed to the setItem function
     */
    public async updateAsync<T extends Record<string,any>>(table:string|TypeDef<T>,id:string,value:Partial<T>):Promise<T>;
    
    /**
     * Deletes an item from a table
     * @param table The name of the table to delete the item from
     * @param id The Id of the item to delete
     * @returns The value of the item before being delete or undefined
     */
    public async deleteAsync<T extends Record<string,any>>(table:string|TypeDef<T>,id:string):Promise<T|undefined>;
}
```

### Store hooks
The store hooks also have the added benefit of automatically receiving updates when changes are made
by the `store()` service.

``` ts

export interface UseStoreItemOptions
{
    /**
     * If true useStoreItem will return undefined
     */
    disabled?:boolean;

    /**
     * If true the value will be reset to null when disabled. By default the last loaded
     * value will be returned when disabled.
     */
    resetOnDisabled?:boolean;

    /**
     * If true the value will be reset to null when table or id changes. By default the last loaded
     * value will be returned until the new value is loaded.
     */
    resetOnChange?:boolean;
}

export type UseStoreItemsOptions = UseStoreItemOptions & SelectOptions;

/**
 * Returns an item by id from a given table. Any updates made to the item elsewhere in the app
 * will cause useStoreItem to return the new value.
 *
 * Undefined is returned if the value does not exist in the table and null is returned while
 * the item is being loaded.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreItem=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T,any>|string|null|undefined,
    id:string|null|undefined,
    options?:UseStoreItemOptions
):T|null|undefined=>;

/**
 * Returns all matching items
 *
 * null is returned while the items are loading.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreMatchingItems=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T>|string|null|undefined,
    match:Partial<T>|null|undefined,
    options?:UseStoreItemsOptions
):T[]|null=>;


/**
 * Returns all matching items
 *
 * Undefined is returned if the value does not exist in the table and null is returned while
 * the item is being loaded.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreFirstMatchingItem=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T>|string|null|undefined,
    match:Partial<T>|null|undefined,
    options?:UseStoreItemsOptions
):T|null|undefined=>;

```

## Full screen screens
The `useFullPage` hook can be used to display a full screen page without the main navigation bar.

example:
``` tsx
import { useFullPage } from "@/lib/hooks";

function ExampleComponent(){

    useFullPage();

    return (
        <div></div>
    )
}
```

## Form Data
When creating forms store form data in a typed useState variable.

Zod schemas can be imported from `@/lib/schema` to validate types stored in the database.

Form state example:
``` tsx

interface NewsletterForm
{
    name:string
    email:string;
}
function ExampleComponent()
{
    const [newsletterData,setNewsletterData]=useState<NewsletterForm>({
        name:'',
        email:'',
    });

    return (
        <form>
            <input
                placeholder="Enter name"
                value={newsletterData.name}
                onChange={e=>setNewsletterData({...newsletterData,name:e.target.value})}
            />
            <input
                placeholder="Enter email"
                value={newsletterData.email}
                onChange={e=>setNewsletterData({...newsletterData,email:e.target.value})}
            />
        </form>
    )
}
```

## Pages
When creating NextJS pages export the page component as a default function with the function
name reflecting the name of the page.

Do not use the MainLayout component when creating a page. The Main Layout component will be
used by the top level App component.

Include the name of the page in the className of the root element of the page component using the
format of: "page--{PageComponentName}"

Example Page with a route of "/example":
``` tsx

export default function ExamplePage(){

    return (
        <div className="page--ExamplePage">
            Example page content
        <div>
    )
}
```


## Packages
This is the package.json file for the project. You can only use libraries based on the dependencies
of the package.json file.

``` json
{
  "name": "mindark-exit",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start"
  },
  "dependencies": {
    "lucide-react": "^0.544.0",
    "markdown-it": "^14.1.0",
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "rxjs": "^7.8.2",
    "uuid": "^13.0.0",
    "zod": "^4.1.11",
    "supabase": "^2.33.9",
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}


```

## Standard Components
The following components can be used

### Logo
Displays the apps logo using an SVG

Import: `import { Logo } from "@/components/Logo";`
Props:
``` ts
interface LogoProps
{
    color?:string;
    /**
     * @default "w-8 h-8"
     */ 
    className?:string;
    size?:string|number;
}
```

### SignInRequired
A card to display when a user does not have access to a screen with links to sign-in or register.
Import: `import { Logo } from "@/components/SignInRequired";`
Props:
``` ts
interface SignInRequiredProps
{

    /**
     * A message to display to the user
     */
    message?:string;
    className?:string;
}
```

### ConvoView
A conversational chat view

Import: `import { ConvoView } from "@/components/ConvoView";`
Props:
``` ts
interface ConvoViewProps
{
    /**
     * A conversation template in Convo-Lang format
     */
    template?:string;

    /**
     * Id of an echo to load. When loaded the user will be able to chat with the echo
     */
    echoId?:string;
    
    className?:string;
}
```

### FileBrowser
Allows a user to pick, browse, upload and manage files.

Import: `import { FileBrowser } from "@/components/FileBrowser";`
Props:
``` ts
interface FileBrowserProps {
    /**
     * The default directory to open the browser in. If no defaultDirectory is supplied the user's
     * home directory will be used: {account_id}/users/{user_id}
     */
    defaultDirectory?: string;

    /**
     * If defined the last directory the user was in should be stored and restored the next time
     * the FileBrowser is opened using the same key. Directories locations should be stored in
     * localStorage using a key of `FileBrowser::lastDir::${browseKey}`
     */
    browseKey?: string;

    /**
     * If true of "multi" the browser should allow the user to pick file(s) to be passed to the
     * onPick callback when the "Accept" button is clicked
     */
    pick?: boolean | "multi";

    /**
     * Called when the user picks a file or files then presses the Accept button
     */
    onPick?: (paths: string[]) => void;

    /**
     * Called when the user clicks the "Cancel" button when selecting files
     */
    onPickCancel?: () => void;

    /**
     * A content type of array of content types allowed for selecting files.
     * If "inode/directory" is an accepted content type directories should be allowed to be selected.
     * The content types should allow wildcards such as "*(slash)image" for selecting images of any type.
     */
    accepts?: string | string[];

    /**
     * Disables uploading new files
     */
    disableUpload?: boolean;

    /**
     * Disables creating new directories
     */
    disableCreateDirectory?: boolean;
}
```

### FileBrowserModal
A modal that displays and extends the FileBrowser component in a fullscreen modal.

Import: `import { FileBrowserModal } from "@/components/FileBrowserModal";`
Props:
``` ts
interface FileBrowserModalProps extends FileBrowserProps
{
    open:boolean;
    closeRequested?:(open:false)=>void;
    modalClassName?:string;
}
```

### Img
An image component that automatically handles converting paths to full urls. The `Img` renders an HTML
img element unless the src prop is undefined and in that case is renders a div with a placeholder
icon.

Import: `import { Img } from "@/components/Img";`
Props:
``` ts
interface ImgProps
{
    src?:string;
    alt:string;
    className?:string;
    onLoadFailed?:()=>void;
}
```

## User Registration

When registering a new user store the user's name and account name in options.data object
of the user sign-up options:
``` ts
await supClient().auth.signUp({
    email: form.email.trim(),
    password: form.password,
    options: {
        data: { name: form.name, accountName:form.accountName },
    },
});
```

When registering a new user do not explicitly insert any values into the database.
User and account setup will be handled by the backend.


## Utility Functions
The following utility functions can be imported from `@/lib/util`

``` ts
export type ClassNameValue = string | false | number | null | undefined | {
    [className: string]: any;
} | ClassNameValue[];

/**
 * Combines class names and ignores falsy values.
 */
export const cn=(...classNames:ClassNameValue[]):string=>;

/**
 * Returns the file name of a preview file for the given file.
 */
export const getPreviewFileName=(name:string,pageIndex=0):string;

/**
 * Returns the full path of a preview file for the given path.
 */
export const getPreviewPath=(path:string,pageIndex=0):string;
```


## Hooks
React components can use the following hooks imported from `@/lib/hooks`

``` ts
/**
 * Hides common UI controls such as the main nav bar.
 * @param enabled If false the hook is disabled
 */
export const useFullPage=(enabled=true)=>;

/**
 * Removes all margins and paddings from the main layout while keeping the main navigation and
 * other shared UI elements
 * @param enabled If false the hook is disabled
 */
export const useNoMargins=(enabled=true)=>;

/**
 * Returns true if the page should be displayed in full screen
 */
export const useIsInFullPageMode=():boolean=>{
    const count=useSubject(fullPageSubject);
    return count>0;
}

/**
 * Returns true if the page should remove all margins
 */
export const useIsNoMarginMode=():boolean=>;

/**
 * Returns the current signed-in user.
 * null === user is being loaded
 * undefined === user is not signed in
 */
export const useCurrentUser=():User|null|undefined=>;

/**
 * Returns the current account the user is signed into.
 * null === account is being loaded
 * undefined === No account found for user
 */
export const useAccount=():Account|null|undefined=>;

/**
 * Returns the role of the user in the current account.
 * null === role is being loaded
 * undefined === No role found for user
 */
export const useUserRole=():UserRole|null|undefined=>;

/**
 * Returns the information about the current user, including a user object, account object
 * and the role the user has for the account.
 * null === user info is being loaded
 * undefined === user is not signed in
 */
export const useUserInfo=():UserInfo|null|undefined=>;
```

## Utility types
The following utility types can be imported from `@/lib/types-util`

``` ts
export interface UserInfo
{
    user:User;
    role?:UserRole;
    membership?:AccountMembership;
    account?:Account;
}

/**
 * Options used with select queries
 */
export interface SelectOptions
{
    offset?:number;
    limit?:number;
    orderBy?:string;
    /**
     * If true return items will be ordered in descending order
     */
    orderByDesc?:boolean;
}
```

## App Controller
The App Controller can be accessed by calling the `app` function imported from `@/lib/app`.

Use can use the App Controller to switch between accounts
``` ts
import { app } from `@/lib/app`

async function switchAccountExample(accountId:string){
    await app().switchAccountAsync(accountId);
}
```

## Convo-Lang
Convo-Lang is a prompt format that can represent system, assistant and user messages in conversation
with an LLM or AI Agent. Each message starts with a `>` character followed by a role then followed
by the content of the message. If the first character on a new line in the content of message
is the `>` character it must be escaped using a backslash.

Convo-Lang example:
``` convo
> system
You are a helpful assistant

> assistant
Hi, how can I help you today

> user
Quote a famous historical figure. If a brief description of the figure then the quote using a markdown block quote

> assistant
**Historical Figure:** Martin Luther King Jr.  
*Martin Luther King Jr. was an American civil rights leader who advocated for nonviolent resistance and played a pivotal role in the movement to end racial segregation in the United States.*

\> "Injustice anywhere is a threat to justice everywhere."
```

Take note of the backslash used with the block quote - `\>`

## Chat History
Chat history should be stored as a string in the Convo-Lang format.