type Props = { onOpenSidebar: () => void };

const amenities = [
  { slug: "pool", title: "Community Pool", image: "/assets/community-pool.jpg" },
  { slug: "tennis", title: "Tennis Courts", image: "/assets/community-tennis.jpg" },
  { slug: "cafe", title: "Clubhouse Cafe", image: "/assets/community-cafe.png" },
  { slug: "garden", title: "Community Garden", image: "/assets/community-garden.jpg" },
];

export default function AmenitiesPage({ onOpenSidebar: _onOpenSidebar }: Props) {
  return (
    <div data-ux-id="amenities-page" className="flex-1 min-w-0 h-full overflow-y-auto bg-[#f6f8fb]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <p className="text-[28px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] mb-6">
          Amenities
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {amenities.map((a) => (
            <div
              key={a.slug}
              data-ux-id={`amenity-tile-${a.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-[0px_2px_9px_rgba(18,17,48,0.07)] cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img src={a.image} alt={a.title} className="w-full h-[260px] object-cover" />
              <div className="p-5">
                <p className="text-[20px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]">
                  {a.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
