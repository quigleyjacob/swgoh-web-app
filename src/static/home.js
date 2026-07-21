export const toolCardsData = [
    {
        public: false,
        guild: false,
        title: 'GAC Planner',
        description: 'Plan, track, and record your GAC attacks',
        url: (id) => `/profile/${id}`,
        tab: 'gacPlanner',
        image: '/gac-preview.png'
    },
    {
        public: false,
        guild: false,
        title: 'Datacrons',
        description: 'Quickly find the best datacron with powerful filters',
        url: (id) => `/profile/${id}`,
        tab: 'datacrons',
        image: '/datacron-preview.png'
    },
    {
        public: false,
        guild: false,
        title: 'Inventory',
        description: 'View all your gear, relics, and currencies in one place',
        url: (id) => `/profile/${id}`,
        tab: 'inventory',
        image: '/inventory_v2.png'
    },
    {
        public: false,
        guild: true,
        title: 'TB Commands',
        description: 'Store TB commands and send them via QuigBot',
        url: (id) => `/guild/${id}`,
        tab: 'TB Commands',
        image: '/tb-map.png'
    },
    {
        public: false,
        guild: true,
        title: 'TB In-Game Commands',
        description: 'Store commands and post them directly to game.',
        url: (id) => `/guild/${id}`,
        tab: 'TB In-Game Commands',
        image: '/tb-ig-preview.png'
    },
    {
        public: false,
        guild: true,
        title: 'TB Operations',
        description: 'Auto‑assign operations and DM each member via QuigBot',
        url: (id) => `/guild/${id}`,
        tab: 'TB Operations',
        image: '/tb-operations.png'
    },
    {
        public: false,
        guild: true,
        title: 'Raid',
        description: 'Check your guild\'s current raid status',
        url: (id) => `/guild/${id}`,
        tab: 'Raid',
        image: '/raid.png'
    },
    {
        public: true,
        title: 'Era Data',
        description: 'Browse era rewards, progression, and loaned units',
        url: () => `/era-data`,
        image: '/era-data.png'
    },
    {
        public: false,
        guild: false,
        title: 'GAC History',
        description: 'Look up past GAC battles to reuse winning teams',
        url: (id) => `/profile/${id}`,
        tab: 'gacHistory',
        image: '/gac-history-preview.png'
    },
    {
        public: true,
        title: 'Leaderboard',
        description: 'See who\'s leading the GAC server rankings',
        url: (id) => `/leaderboard`,
        image: '/leaderboard.png'
    },
    {
        public: true,
        title: 'Infographics',
        description: 'Access TB, Datacron, and other helpful infographics',
        url: (id) => `/infographics`,
        image: '/reva-preview.png'
    },
]