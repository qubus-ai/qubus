
export function join(base: string, file: string): string
{
    let path: string;

    let sep = base.lastIndexOf("/");
    if(sep != -1)
    {
        path = base + '/' + file;
    }
    else{
        path = base + '\\' + file;
    }

    return path;
}