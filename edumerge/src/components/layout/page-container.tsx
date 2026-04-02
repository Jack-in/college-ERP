import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface ComponentProps {
  showBreadCrumb?: boolean;
  children: ReactNode;
  src?: ReactNode | string;
  title?: string | ReactNode;
  subtitle?: ReactNode;
  cardClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  className?: string;
  iconClassName?: string;
  endActionComponent?: ReactNode;
  footerComponent?: ReactNode;
  separator?: boolean;
  loading?: boolean;
  separatorClassName?: string;
  cardContent?: ReactNode;
  isImage?: boolean;
  hideHeader?: boolean;
}

const PageContainer = ({
  title,
  src,
  children,
  titleClassName,
  subtitle,
  subtitleClassName,
  iconClassName,
  endActionComponent,
  footerComponent,
  cardClassName,
  loading = false,
  hideHeader = false,
}: ComponentProps) => {

  return (
    <div>
      <Card
        className="w-full flex justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 border-0!">
        {!hideHeader && (
          <CardHeader className="p-0 pt-2 px-2 sticky top-0 w-full shrink-0">
            <div className="flex justify-between items-center w-full gap-3 z-10">
              <div className="flex space-x-4 items-center">

                {src && typeof src === 'string' ? (
                  <img src={src} className={cn('h-12 w-12 rounded-md object-cover', iconClassName)} alt="Icon" />
                ) : src ? (
                  <div className={cn('h-12 w-12 bg-brand-blue/10 text-brand-blue rounded-md flex items-center justify-center font-semibold', iconClassName)}>
                    {src}
                  </div>
                ) : null}

                <div className="flex flex-col justify-center w-full">
                  {title && (
                    <div className={cn('font-bold text-2xl tracking-tight text-brand-blue capitalize', titleClassName)}>
                      {title}
                    </div>
                  )}
                  {subtitle && (
                    <div className={cn('text-brand-muted text-sm font-medium mt-0.5 capitalize', subtitleClassName)}>
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>

              {endActionComponent && endActionComponent}
            </div>

          </CardHeader>
        )}

        <CardContent
          className={cn(
            'px-8 py-6 flex-1 overflow-y-auto space-y-4 bg-white p-4 border rounded-md',
            cardClassName,
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" />
            </div>
          ) : children}
        </CardContent>

        {footerComponent && (
          <CardFooter className="px-8 pb-4 border-t pt-4 bg-gradient-to-br from-blue-50 to-white shrink-0 sticky bottom-0 z-10">
            {footerComponent}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PageContainer;
