import { redirect } from 'next/navigation';

export default async function LearnRedirect() {
  redirect('/home');
}
