export const series = [
  {
    id: 'robot',
    slug: 'robot-series',
    name: '로봇 시리즈',
    nameEn: 'Robot Series',
    tagline: '기계 속에 숨은 감성, 한 획 한 획 색칠해 보세요',
    taglineEn: 'Discover emotions hidden in machines',
    description: '정교한 메카닉 디테일과 역동적인 로봇 캐릭터들이 가득한 시리즈입니다. 금속의 차가움 속에서 따뜻한 색감을 입혀보세요.',
    descriptionEn: 'A series full of intricate mechanical details and dynamic robot characters. Add warm colors to cold metal.',
    primaryColor: '#2563EB',
    secondaryColor: '#DC2626',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 50%, #DC2626 100%)',
    icon: 'robot',
    image: '/images/series/robot.png',
  },
  {
    id: 'aquarium',
    slug: 'aquarium-series',
    name: '아쿠아리움 시리즈',
    nameEn: 'Aquarium Series',
    tagline: '깊고 푸른 바다 속 세계를 채색으로 표현해 보세요',
    taglineEn: 'Color the deep blue underwater world',
    description: '신비로운 해양 생물과 아름다운 수중 풍경이 펼쳐지는 시리즈입니다. 푸른빛부터 산호의 화사함까지 다채로운 색감을 경험하세요.',
    descriptionEn: 'Mysterious marine life and beautiful underwater landscapes. Experience colors from deep blue to vibrant coral.',
    primaryColor: '#06B6D4',
    secondaryColor: '#0891B2',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 50%, #164E63 100%)',
    icon: 'fish',
    image: '/images/series/aquarium.png',
  },
  {
    id: 'idol-fairy',
    slug: 'idol-fairy-series',
    name: '아이돌요정 시리즈',
    nameEn: 'Idol Fairy Series',
    tagline: '반짝이는 무대 위의 요정들에게 컬러를 선물하세요',
    taglineEn: 'Gift colors to the sparkling fairies on stage',
    description: '화려한 의상과 반짝이는 날개를 가진 아이돌 요정 캐릭터들의 시리즈입니다. 핑크와 퍼플의 환상적인 색감을 마음껏 칠해보세요.',
    descriptionEn: 'Idol fairy characters with gorgeous costumes and sparkling wings. Enjoy the fantastic pink and purple palette.',
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #8B5CF6 100%)',
    icon: 'fairy',
    image: '/images/series/idol-fairy.png',
  },
  {
    id: 'safari',
    slug: 'safari-series',
    name: '사파리 시리즈',
    nameEn: 'Safari Series',
    tagline: '야생의 자연과 동물들을 색으로 만나보세요',
    taglineEn: 'Meet wild nature and animals through colors',
    description: '광활한 사바나부터 울창한 정글까지, 다양한 야생 동물들과 자연을 만나는 시리즈입니다. 대자연의 색감을 자유롭게 표현해보세요.',
    descriptionEn: 'From vast savannas to lush jungles, meet various wild animals and nature. Express the colors of the wild freely.',
    primaryColor: '#EAB308',
    secondaryColor: '#16A34A',
    gradient: 'linear-gradient(135deg, #EAB308 0%, #65A30D 50%, #16A34A 100%)',
    icon: 'lion',
    image: '/images/series/safari.png',
  },
];

export function getSeriesBySlug(slug) {
  return series.find((s) => s.slug === slug);
}

export function getSeriesById(id) {
  return series.find((s) => s.id === id);
}
