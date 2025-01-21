export const toolCardsData = [
    {
        public: false,
        guild: false,
        title: 'GAC Planner',
        description: 'Allows you to strategize, prepare, and record your attacks against your GAC opponent.',
        url: (id) => `/profile/${id}`,
        tab: 'gacPlanner',
        image: '/gac-preview.png'
    },
    {
        public: false,
        guild: true,
        title: 'TB Commands',
        description: 'Keep your TB Commands in one place and use the QuigBot Discord Bot to directly write them out in your announcements channel.',
        url: (id) => `/guild/${id}`,
        tab: 'TB Commands',
        image: '/tb-map.png'
    },
    {
        public: true,
        title: 'Infographics',
        description: 'Access a variety of infographics related to TB, Datacrons, and more!',
        url: (id) => `/infographics`,
        image: '/reva-preview.png'
    },
    {
        public: false,
        guild: false,
        title: 'Datacrons',
        description: 'Easily find the perfect datacron for your squad with the advanced filtering options found nowhere else!',
        url: (id) => `/profile/${id}`,
        tab: 'datacrons',
        image: '/datacron-preview.png'
    },
    {
        public: false,
        guild: false,
        title: 'GAC History',
        description: 'Quickly find your previous GAC attacks to find a team that you know works.',
        url: (id) => `/profile/${id}`,
        tab: 'gacHistory',
        image: '/gac-history-preview.png'
    },
    {
        public: false,
        guild: true,
        title: 'TB Operations',
        description: 'Determine which operations your guild is capable of filling as well as which toons are needed to fill more operations.',
        url: (id) => `/guild/${id}`,
        tab: 'TB Operations',
        image: '/tb-operations.png'
    },
    {
        public: false,
        guild: false,
        title: 'Inventory',
        description: 'From one menu, have a bird\'s-eye view of all gear, relics, and currencies in your roster.',
        url: (id) => `/profile/${id}`,
        tab: 'inventory',
        image: '/inventory_v2.png'
    },
    {
        public: true,
        title: 'Leaderboard',
        description: 'View the GAC Server Leaderboard to see who is leading the pack!',
        url: (id) => `/leaderboard`,
        image: '/leaderboard.png'
    }
]

export const newsCardsData = [
    {
        href: 'https://forums.ea.com/blog/swgoh-game-info-hub-en/era-of-the-cavalry---bad-batch/5049853',
        image: '/tex.purchase_era02_front.png',
        title: 'Era of the Cavalry has begun!',
        description: 'Click to learn more.'
    },
    {
        href: 'https://forums.ea.com/blog/swgoh-game-info-hub-en/kit-reveal-omega-fugitive/5050956',
        image: '/tex.events_omegas3.png',
        title: 'Omega (Fugitive) is now in-game',
        description: 'See her kit reveal here.'
    }
]