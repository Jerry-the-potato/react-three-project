import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function MainGrid(){
    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
          {/* cards */}
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Overview
          </Typography>
          <Grid
            container
            spacing={2}
            columns={12}
            sx={{ mb: (theme) => theme.spacing(2)}}
          >
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ bgcolor: 'primary.light' }}>
                1
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ bgcolor: 'primary.light' }}>
                2
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ bgcolor: 'primary.light' }}>
                3
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ bgcolor: 'primary.light' }}>
                4
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ bgcolor: 'primary.light' }}>
                5
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ bgcolor: 'primary.light' }}>
                6
            </Grid>
          </Grid>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Details
          </Typography>
          <Grid container spacing={2} columns={12}>
            <Grid size={{ xs: 12, lg: 9 }}>
                7
            </Grid>
            <Grid size={{ xs: 12, lg: 3 }}>
              <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
                8
              </Stack>
            </Grid>
          </Grid>
        </Box>
    );
}