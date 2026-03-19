export const galleryItems = [
  // Robot Series
  {
    id: 'robot-warrior-01',
    slug: 'robot-warrior-01',
    title: '가디언 워리어',
    titleEn: 'Guardian Warrior',
    series: 'robot',
    description: '도시를 지키는 거대 로봇 가디언 워리어. 정교한 갑옷 디테일이 돋보이는 채색 작품입니다.',
    featured: true,
  },
  {
    id: 'robot-explorer-02',
    slug: 'robot-explorer-02',
    title: '스페이스 탐험가',
    titleEn: 'Space Explorer',
    series: 'robot',
    description: '우주를 탐험하는 소형 탐사 로봇. 부드러운 곡선과 디테일한 관절이 특징입니다.',
    featured: false,
  },
  {
    id: 'robot-knight-03',
    slug: 'robot-knight-03',
    title: '메카 기사',
    titleEn: 'Mecha Knight',
    series: 'robot',
    description: '중세 기사 갑옷을 입은 메카닉 로봇. 검과 방패의 디테일을 색칠해보세요.',
    featured: true,
  },
  // Aquarium Series
  {
    id: 'aquarium-coral-01',
    slug: 'aquarium-coral-01',
    title: '산호 정원',
    titleEn: 'Coral Garden',
    series: 'aquarium',
    description: '화려한 산호와 열대어가 어우러진 수중 정원. 따뜻한 수중 세계를 표현해보세요.',
    featured: true,
  },
  {
    id: 'aquarium-jellyfish-02',
    slug: 'aquarium-jellyfish-02',
    title: '해파리의 춤',
    titleEn: 'Jellyfish Dance',
    series: 'aquarium',
    description: '투명하게 빛나는 해파리들의 우아한 군무. 몽환적인 색감을 표현해보세요.',
    featured: false,
  },
  {
    id: 'aquarium-turtle-03',
    slug: 'aquarium-turtle-03',
    title: '바다거북의 여행',
    titleEn: 'Sea Turtle Journey',
    series: 'aquarium',
    description: '넓은 바다를 유영하는 바다거북. 깊고 푸른 바다의 색감을 담아보세요.',
    featured: true,
  },
  // Idol Fairy Series
  {
    id: 'fairy-star-01',
    slug: 'fairy-star-01',
    title: '스타라이트 요정',
    titleEn: 'Starlight Fairy',
    series: 'idol-fairy',
    description: '별빛을 머금은 아이돌 요정. 반짝이는 의상과 날개의 디테일이 아름답습니다.',
    featured: true,
  },
  {
    id: 'fairy-bloom-02',
    slug: 'fairy-bloom-02',
    title: '블룸 프린세스',
    titleEn: 'Bloom Princess',
    series: 'idol-fairy',
    description: '꽃잎을 날개로 가진 요정 공주. 화사한 핑크와 퍼플 색감을 연출해보세요.',
    featured: false,
  },
  {
    id: 'fairy-moon-03',
    slug: 'fairy-moon-03',
    title: '달빛 무희',
    titleEn: 'Moonlight Dancer',
    series: 'idol-fairy',
    description: '달빛 아래 춤추는 아이돌 요정. 은빛과 보랏빛이 어우러진 환상적인 장면입니다.',
    featured: true,
  },
  // Safari Series
  {
    id: 'safari-lion-01',
    slug: 'safari-lion-01',
    title: '사자왕의 초상',
    titleEn: 'Portrait of the Lion King',
    series: 'safari',
    description: '위풍당당한 수사자의 갈기를 자유롭게 채색해보세요. 대자연의 왕을 표현하는 작품입니다.',
    featured: true,
  },
  {
    id: 'safari-elephant-02',
    slug: 'safari-elephant-02',
    title: '코끼리 가족',
    titleEn: 'Elephant Family',
    series: 'safari',
    description: '평화로운 코끼리 가족의 행진. 따뜻한 황금빛 사바나를 배경으로 채색해보세요.',
    featured: false,
  },
  {
    id: 'safari-giraffe-03',
    slug: 'safari-giraffe-03',
    title: '기린과 석양',
    titleEn: 'Giraffe and Sunset',
    series: 'safari',
    description: '아프리카 석양 아래 서 있는 기린. 오렌지빛 하늘과 자연의 색감을 표현해보세요.',
    featured: true,
  },
];

export function getGalleryBySlug(slug) {
  return galleryItems.find((item) => item.slug === slug);
}

export function getGalleryBySeries(seriesId) {
  return galleryItems.filter((item) => item.series === seriesId);
}

export function getFeaturedGallery() {
  return galleryItems.filter((item) => item.featured);
}
