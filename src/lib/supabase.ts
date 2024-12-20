// route.ts
export async function POST(req: Request) {
    try {
      const body = await req.text();
      const data = JSON.parse(body);
      
      // إضافة البيانات لقاعدة البيانات
      const { data: message, error } = await supabase
        .from('webhook_messages')
        .insert([{
          type: data.type || 'embed',
          title: data.title,
          description: data.description,
          url: data.url,
          color: data.color,
          author_name: data.author_name,
          author_icon_url: data.author_icon_url,
          thumbnail_url: data.thumbnail_url,
          image_url: data.image_url,
          footer_text: data.footer_text,
          footer_icon_url: data.footer_icon_url,
          fields: data.fields || [],
          timestamp: data.timestamp || new Date().toISOString()
        }])
        .select()
        .single();
  
      if (error) throw error;
  
      return NextResponse.json({
        success: true,
        data: message
      }, { 
        status: 201 
      });
  
    } catch (error) {
      console.error('Webhook error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }