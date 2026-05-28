import { getReviews } from "@/lib/reviews";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getReviews();

  return <HomeClient reviews={data.reviews} />;
}
