const UserWhiteList = [
    
]

export default function checkWhiteList(opemid: string) {
    return UserWhiteList.includes(opemid)
}

