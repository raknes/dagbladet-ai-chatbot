import { signIn } from "../auth";
 
export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        const email = formData.get('email');
        if (email != null && (
            email.toString() === 'raknes@hotmail.com' ||
            email.toString().endsWith('@aller.com') ||
            email.toString().endsWith('@remoteproduction.no') ||
            email.toString().endsWith('@dagbladet.no') ||
            email.toString().endsWith('@db.no') ||
            email.toString().endsWith('@seher.no') ||
            email.toString().endsWith('@kk.no') ||
            email.toString().endsWith('@sol.no'))) {
            await signIn("resend", formData);
        } else {
            return null;
        }
      }}
      className="flex flex-col items-center gap-4 space-y-3"
    >
        <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md  md:w-96 dark:bg-zinc-950">
            <input type="text" name="email" placeholder="Email" />
            <button type="submit">Signin</button>
        </div>
    </form>
  )
}

export default SignIn;