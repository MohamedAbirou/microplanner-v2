import { SetMetadata } from '@nestjs/common';
import { ApiScope } from '../../premium/types/premium.types';

export const API_SCOPE_KEY = 'api_scope';

export const RequireApiScope = (scope: ApiScope) => SetMetadata(API_SCOPE_KEY, scope);
